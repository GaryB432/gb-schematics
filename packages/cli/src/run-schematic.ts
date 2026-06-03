/* eslint @typescript-eslint/no-explicit-any: 0,  @typescript-eslint/no-unused-vars: 1 */

import { getSystemPath, json, normalize, virtualFs } from '@angular-devkit/core';
import { createConsoleLogger, NodeJsSyncHost } from '@angular-devkit/core/node/index.js';
import { HostTree, SchematicEngine, type Tree } from '@angular-devkit/schematics';
import { DryRunSink } from '@angular-devkit/schematics/src/sink/dryrun.js';
import { HostSink } from '@angular-devkit/schematics/src/sink/host.js';
import { BuiltinTaskExecutor } from '@angular-devkit/schematics/tasks/node/index.js';
import { NodeModulesEngineHost } from '@angular-devkit/schematics/tools/index.js';
import { cancel, confirm, isCancel, select, spinner, text } from '@clack/prompts';
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
  [key: string]: unknown;
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

function formatSchemaErrorPath(instancePath?: string, propertyName?: string): string {
  if (instancePath && instancePath.length > 1) {
    return `--${instancePath.slice(1).replace(/\//g, '.')}`;
  }

  if (propertyName) {
    return `--${propertyName}`;
  }

  return 'options';
}

function formatSchemaValidationErrors(
  errors: readonly json.schema.SchemaValidatorError[],
): string {
  return errors
    .map((error) => {
      const missingProperty =
        error.keyword === 'required' &&
        typeof error.params === 'object' &&
        error.params !== null &&
        'missingProperty' in error.params
          ? String((error.params as { missingProperty: string }).missingProperty)
          : undefined;

      const location = formatSchemaErrorPath(error.instancePath, missingProperty);
      const message = error.message ?? 'Invalid value';

      return `${location}: ${message}`;
    })
    .join('\n');
}

function getMissingRequiredOptions(
  errors: readonly json.schema.SchemaValidatorError[] = [],
): string[] {
  const missing = new Set<string>();

  for (const error of errors) {
    if (error.keyword !== 'required') {
      continue;
    }

    if (
      typeof error.params === 'object' &&
      error.params !== null &&
      'missingProperty' in error.params
    ) {
      const missingProperty = String((error.params as { missingProperty: string }).missingProperty);
      if (missingProperty) {
        missing.add(missingProperty);
      }
    }
  }

  return [...missing];
}

function createSchemaRegistry(): json.schema.CoreSchemaRegistry {
  const registry = new json.schema.CoreSchemaRegistry();
  registry.addPostTransform(json.schema.transforms.addUndefinedDefaults);
  // Register known schematic formats up front to prevent noisy unknown-format warnings.
  registry.addFormat({
    name: 'path',
    formatter: {
      type: 'string',
      validate: (value: string) => typeof value === 'string' && !value.includes('\0'),
    },
  });

  return registry;
}

async function validateOptionsWithDevkitSchema(
  registry: json.schema.CoreSchemaRegistry,
  schema: JsonSchema,
  options: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const validator = await registry.compile(schema as json.JsonObject);
  const result = await validator(options as unknown as json.JsonValue);

  if (!result.success) {
    const errors = result.errors ?? [];
    const details = result.errors?.length
      ? `\n${formatSchemaValidationErrors(result.errors)}`
      : '';
    const validationError = new Error(`Invalid schematic options.${details}`) as Error & {
      errors: readonly json.schema.SchemaValidatorError[];
    };
    validationError.errors = errors;
    throw validationError;
  }

  return (result.data as Record<string, unknown>) ?? options;
}

async function resolveOptionsFromSchema(
  schema: JsonSchema,
  initialOptions: Record<string, unknown>,
) {
  const properties = schema.properties ?? {};
  const resolvedOptions: Record<string, unknown> = { ...initialOptions };
  const registry = createSchemaRegistry();

  for (;;) {
    try {
      return await validateOptionsWithDevkitSchema(registry, schema, resolvedOptions);
    } catch (error: unknown) {
      const validationErrors =
        typeof error === 'object' &&
        error !== null &&
        'errors' in error &&
        Array.isArray((error as { errors?: unknown[] }).errors)
          ? ((error as { errors: json.schema.SchemaValidatorError[] }).errors ?? [])
          : [];

      const missingRequired = getMissingRequiredOptions(validationErrors).filter(
        (name) => !isProvided(resolvedOptions[name]),
      );

      if (!missingRequired.length || !canPrompt()) {
        throw error;
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
    }
  }
}

export async function runSchematic(argv: any) {
  const {
    collection: providedCollectionName,
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

  const collectionName =
    typeof providedCollectionName === 'string' && providedCollectionName.length > 0
      ? providedCollectionName
      : '@gb-schematics/schematics';

  const s = canPrompt() ? spinner() : null;
  s?.start('Resolving collection...');

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

    s?.message(`Running schematic ${schematicName}...`);

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

    s?.message('Committing changes...');

    // Choose sink based on dryRun flag
    const sink = dryRun ? new DryRunSink(fsHost as any, force) : new HostSink(fsHost as any, force);

    await lastValueFrom(sink.commit(resultTree) as any);

    s?.stop('Done!');

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
    if (s) {
      s.stop(`Failed: ${error.message}`);
    } else {
      console.error(`Failed: ${error.message}`);
    }
    if (verbose) {
      console.error(error);
    }
    process.exit(1);
  }
}
