/* eslint @typescript-eslint/no-explicit-any: 0 */

import { cancel, isCancel, select } from '@clack/prompts';

export async function helpSchematic(argv: any) {
  const {
    collection: providedCollectionName,
    schematic: providedSchematicName,
  } = argv;

  const collectionName =
    typeof providedCollectionName === 'string' &&
    providedCollectionName.length > 0
      ? providedCollectionName
      : '@gb-schematics/schematics';

  const schematicName = await resolveSchematicName(
    collectionName,
    providedSchematicName
  );

  console.log(
    collectionName,
    providedSchematicName,
    schematicName,
    'help is on the way'
  );
}

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
