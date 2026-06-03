import { getSystemPath, normalize, virtualFs } from '@angular-devkit/core';
import { createConsoleLogger } from '@angular-devkit/core/node/index.js';
import { NodeJsSyncHost } from '@angular-devkit/core/node/index.js';
import { HostTree, SchematicEngine, Tree } from '@angular-devkit/schematics';
import { DryRunSink } from '@angular-devkit/schematics/src/sink/dryrun.js';
import { HostSink } from '@angular-devkit/schematics/src/sink/host.js';
import { NodeModulesEngineHost } from '@angular-devkit/schematics/tools/index.js';
import { BuiltinTaskExecutor } from '@angular-devkit/schematics/tasks/node/index.js';
import { cancel, confirm, isCancel, select, text } from '@clack/prompts';
import ora from 'ora';
import { lastValueFrom, of } from 'rxjs';

type JsonSchemaProperty = {
  type?: string;
  enum?: Array<string | number>;
  description?: string;
  default?: unknown;
};

type JsonSchema = {
  additionalProperties?: boolean;
  required?: string[];
  properties?: Record<string, JsonSchemaProperty>;
};

function canPrompt(): boolean {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY && !process.env.CI);
}

async function resolveSchematicName(
  collection: any,
  providedSchematicName?: string,
): Promise<string> {
  if (providedSchematicName) {
    return providedSchematicName;
  }

  const availableSchematics = Object.keys(collection.description?.schematics ?? {});

  if (!availableSchematics.length) {
    throw new Error(
      `No schematics found in collection "${collection.description?.name ?? 'unknown'}".`,
    );
  }

  if (!canPrompt()) {
    throw new Error('Missing schematic name. Use "generate <schematic>" in scripts and CI.');
  }

  const selected = await select({
    message: 'Select a schematic to run',
    options: availableSchematics.map((schematicName) => ({
      label: schematicName,
      value: schematicName,
    })),
  });

  if (isCancel(selected)) {
    cancel('Operation cancelled.');
    process.exit(1);
  }

  return selected;
}

function isProvided(value: unknown): boolean {
  return value !== undefined && value !== null && value !== '';
}

function parseTypedValue(raw: string, type?: string): unknown {
  if (type === 'number' || type === 'integer') {
    const parsed = Number(raw);
    if (Number.isNaN(parsed)) {
      throw new Error(`Invalid ${type} value: ${raw}`);
    }
    return type === 'integer' ? Math.trunc(parsed) : parsed;
  }
  return raw;
}

function isValidType(value: unknown, type?: string): boolean {
  if (!type) {
    return true;
  }

  if (type === 'string') {
    return typeof value === 'string';
  }

  if (type === 'boolean') {
    return typeof value === 'boolean';
  }

  if (type === 'number') {
    return typeof value === 'number' && !Number.isNaN(value);
  }

  if (type === 'integer') {
    return typeof value === 'number' && Number.isInteger(value);
  }

  if (type === 'array') {
    return Array.isArray(value);
  }

  if (type === 'object') {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  return true;
}

function formatAllowedValues(values: Array<string | number>): string {
  return values.map((value) => JSON.stringify(value)).join(', ');
}

function validateOptionsAgainstSchema(
  schema: JsonSchema,
  options: Record<string, unknown>,
): Record<string, unknown> {
  const properties = schema.properties ?? {};

  if (schema.additionalProperties === false) {
    const unknownOptionNames = Object.keys(options).filter((name) => !(name in properties));
    if (unknownOptionNames.length) {
      const unknownFlags = unknownOptionNames.map((name) => `--${name}`).join(', ');
      throw new Error(`Unknown option(s): ${unknownFlags}.`);
    }
  }

  for (const [optionName, value] of Object.entries(options)) {
    const schemaProp = properties[optionName];
    if (!schemaProp || value === undefined) {
      continue;
    }

    if (!isValidType(value, schemaProp.type)) {
      throw new Error(`Invalid value for --${optionName}: expected ${schemaProp.type}.`);
    }

    if (schemaProp.enum?.length && !schemaProp.enum.includes(value as string | number)) {
      throw new Error(
        `Invalid value for --${optionName}: ${JSON.stringify(value)}. Expected one of ${formatAllowedValues(schemaProp.enum)}.`,
      );
    }
  }

  return options;
}

async function resolveOptionsFromSchema(
  schema: JsonSchema,
  initialOptions: Record<string, unknown>,
) {
  const required = schema.required ?? [];
  const properties = schema.properties ?? {};
  const resolvedOptions: Record<string, unknown> = { ...initialOptions };

  const missingRequired = required.filter((name) => !isProvided(resolvedOptions[name]));
  if (!missingRequired.length) {
    return validateOptionsAgainstSchema(schema, resolvedOptions);
  }

  if (!canPrompt()) {
    const missingFlags = missingRequired.map((name) => `--${name}`).join(', ');
    throw new Error(`Missing required option(s): ${missingFlags}.`);
  }

  for (const optionName of missingRequired) {
    const schemaProp = properties[optionName] ?? {};
    const message = schemaProp.description || `Enter value for ${optionName}`;

    if (schemaProp.enum?.length) {
      const hasOnlyNumberEnumValues = schemaProp.enum.every((value) => typeof value === 'number');
      const enumOptions = hasOnlyNumberEnumValues
        ? schemaProp.enum.map((value) => ({
            label: String(value),
            value: value as number,
          }))
        : schemaProp.enum.map((value) => ({
            label: String(value),
            value: String(value),
          }));

      const picked = await (select as any)({
        message,
        options: enumOptions,
      });
      if (isCancel(picked)) {
        cancel('Operation cancelled.');
        process.exit(1);
      }
      resolvedOptions[optionName] = picked;
      continue;
    }

    if (schemaProp.type === 'boolean') {
      const picked = await confirm({
        message,
        initialValue: Boolean(schemaProp.default ?? false),
      });
      if (isCancel(picked)) {
        cancel('Operation cancelled.');
        process.exit(1);
      }
      resolvedOptions[optionName] = picked;
      continue;
    }

    const entered = await text({
      message,
      placeholder: schemaProp.default ? String(schemaProp.default) : undefined,
      validate: (value) => (value.trim().length ? undefined : `${optionName} is required`),
    });

    if (isCancel(entered)) {
      cancel('Operation cancelled.');
      process.exit(1);
    }

    resolvedOptions[optionName] = parseTypedValue(entered, schemaProp.type);
  }

  return validateOptionsAgainstSchema(schema, resolvedOptions);
}

export async function runSchematic(argv: any) {
  const {
    collection: collectionName,
    c: _collectionAlias,
    n: _nameAlias,
    '--': _passthroughArgs,
    _: _positionalArgs,
    'dry-run': _dryRunKebab,
    dryRun,
    force,
    schematic: providedSchematicName,
    verbose,
    ...options
  } = argv;

  const spinner = ora('Resolving collection...').start();

  try {
    const engineHost = new NodeModulesEngineHost();
    const engine = new SchematicEngine(engineHost);

    const cwdRoot = normalize(process.cwd());
    engineHost.registerTaskExecutor(BuiltinTaskExecutor.NodePackage, {
      allowPackageManagerOverride: true,
      rootDirectory: getSystemPath(cwdRoot),
    });
    engineHost.registerTaskExecutor(BuiltinTaskExecutor.RepositoryInitializer, {
      rootDirectory: getSystemPath(cwdRoot),
    });
    engineHost.registerTaskExecutor(BuiltinTaskExecutor.RunSchematic);

    engineHost.registerOptionsTransform(((desc: any, options: any) => options) as any);

    const logger = createConsoleLogger(verbose);

    const collection = engine.createCollection(collectionName);
    const schematicName = await resolveSchematicName(collection, providedSchematicName);
    const schematic = collection.createSchematic(schematicName);
    const schemaJson = (schematic as any).description?.schemaJson as JsonSchema | undefined;
    const inputOptions = schemaJson
      ? await resolveOptionsFromSchema(schemaJson, options as Record<string, unknown>)
      : options;

    spinner.text = `Running schematic ${schematicName}...`;

    // Scope the host to CWD so schematic paths like /src/app resolve correctly
    const fsHost = new virtualFs.ScopedHost(new NodeJsSyncHost(), cwdRoot);

    // Start from a host-backed tree so schematics can read existing files in CWD.
    const baseTree = new HostTree(fsHost as any);

    const resultTree = (await lastValueFrom(
      schematic.call(inputOptions, of(baseTree) as any, {
        interactive: false,
        logger,
      }) as any,
    )) as Tree;

    spinner.text = 'Committing changes...';

    // Choose sink based on dryRun flag
    const sink = dryRun ? new DryRunSink(fsHost as any, force) : new HostSink(fsHost as any, force);

    await lastValueFrom(sink.commit(resultTree) as any);

    spinner.succeed('Done!');

    if (dryRun) {
      console.log('\nNOTE: Dry run enabled. No files were actually written.');
    }

    if (resultTree?.actions?.length) {
      for (const action of resultTree.actions) {
        const actionPath = (action as { path?: string }).path;
        if (actionPath) {
          console.log(`  ✓ ${actionPath}`);
        }
      }
    }
  } catch (error: any) {
    spinner.fail(`Failed: ${error.message}`);
    if (verbose) {
      console.error(error);
    }
    process.exit(1);
  }
}
