/* eslint @typescript-eslint/no-explicit-any: 0,  @typescript-eslint/no-unused-vars: 1 */

import { getSystemPath, normalize, virtualFs } from '@angular-devkit/core';
import {
  createConsoleLogger,
  NodeJsSyncHost,
} from '@angular-devkit/core/node/index.js';
import {
  HostTree,
  SchematicEngine,
  type Tree,
} from '@angular-devkit/schematics';
import { DryRunSink } from '@angular-devkit/schematics/src/sink/dryrun.js';
import { HostSink } from '@angular-devkit/schematics/src/sink/host.js';
import { BuiltinTaskExecutor } from '@angular-devkit/schematics/tasks/node/index.js';
import { NodeModulesEngineHost } from '@angular-devkit/schematics/tools/index.js';
import {
  cancel,
  confirm,
  isCancel,
  select,
  spinner,
  text,
} from '@clack/prompts';
import { lastValueFrom, of } from 'rxjs';
import {
  asJsonSchema,
  type JsonSchemaProperty,
  resolveOptionsFromSchema,
} from './schema-validator.js';

function canPrompt(): boolean {
  return Boolean(
    process.stdin.isTTY && process.stdout.isTTY && !process.env.CI
  );
}

async function resolveSchematicName(
  collection: any,
  providedSchematicName?: string
): Promise<string> {
  if (providedSchematicName) {
    return providedSchematicName;
  }

  const availableSchematics = Object.keys(
    collection.description?.schematics ?? {}
  );

  if (!availableSchematics.length) {
    throw new Error(
      `No schematics found in collection "${collection.description?.name ?? 'unknown'}".`
    );
  }

  if (!canPrompt()) {
    throw new Error(
      'Missing schematic name. Use "generate <schematic>" in scripts and CI.'
    );
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

function getPreferredSchemaType(
  type: JsonSchemaProperty['type']
): string | undefined {
  if (Array.isArray(type)) {
    if (type.includes('integer')) {
      return 'integer';
    }
    if (type.includes('number')) {
      return 'number';
    }
    if (type.includes('string')) {
      return 'string';
    }
    if (type.includes('boolean')) {
      return 'boolean';
    }
    return undefined;
  }

  return type;
}

function parseTypedValue(
  raw: string,
  type: JsonSchemaProperty['type']
): unknown {
  const preferredType = getPreferredSchemaType(type);

  if (preferredType === 'number' || preferredType === 'integer') {
    const parsed = Number(raw);
    if (Number.isNaN(parsed)) {
      throw new Error(`Invalid ${preferredType} value: ${raw}`);
    }
    return preferredType === 'integer' ? Math.trunc(parsed) : parsed;
  }
  return raw;
}

function getPromptMessage(
  schemaProp: JsonSchemaProperty,
  optionName: string
): string {
  const promptDef = schemaProp['x-prompt'];
  if (typeof promptDef === 'string' && promptDef.trim().length) {
    return promptDef;
  }
  if (
    typeof promptDef === 'object' &&
    promptDef !== null &&
    typeof promptDef.message === 'string' &&
    promptDef.message.trim().length
  ) {
    return promptDef.message;
  }
  return schemaProp.description || `Enter value for ${optionName}`;
}

async function promptForOption(
  optionName: string,
  schemaProp: JsonSchemaProperty,
  resolvedOptions: Record<string, unknown>,
  requiredOptionNames: ReadonlySet<string>
): Promise<void> {
  const message = getPromptMessage(schemaProp, optionName);
  const isRequired = requiredOptionNames.has(optionName);

  if (schemaProp.enum?.length) {
    const enumValues = schemaProp.enum.filter(
      (value): value is string | number | boolean =>
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
    );

    if (enumValues.length) {
      const enumOptions = enumValues.map((value) => ({
        label: String(value),
        value,
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
      return;
    }
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
    return;
  }

  const entered = await text({
    message,
    placeholder: schemaProp.default ? String(schemaProp.default) : undefined,
    validate: (value) => {
      if (value.trim().length || !isRequired) {
        return undefined;
      }
      return `${optionName} is required`;
    },
  });

  if (isCancel(entered)) {
    cancel('Operation cancelled.');
    process.exit(1);
  }

  if (!entered.trim().length && !isRequired) {
    return;
  }

  resolvedOptions[optionName] = parseTypedValue(entered, schemaProp.type);
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
    typeof providedCollectionName === 'string' &&
    providedCollectionName.length > 0
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

    engineHost.registerOptionsTransform(
      ((desc: any, options: any) => options) as any
    );

    const logger = createConsoleLogger(verbose);

    const collection = engine.createCollection(collectionName);
    const schematicName = await resolveSchematicName(
      collection,
      providedSchematicName
    );
    const schematic = collection.createSchematic(schematicName);
    const rawSchemaJson = (schematic as any).description?.schemaJson;
    const schemaJson = rawSchemaJson ? asJsonSchema(rawSchemaJson) : undefined;
    const inputOptions = schemaJson
      ? await resolveOptionsFromSchema(
          schemaJson,
          options as Record<string, unknown>,
          canPrompt,
          promptForOption
        )
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
      }) as any
    )) as Tree;

    s?.message('Committing changes...');

    // Choose sink based on dryRun flag
    const sink = dryRun
      ? new DryRunSink(fsHost as any, force)
      : new HostSink(fsHost as any, force);

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
