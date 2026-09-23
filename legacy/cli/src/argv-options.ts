const knownOptionNames = new Set([
  'c',
  'collection',
  'dry-run',
  'dryRun',
  'dryrun',
  'force',
  'n',
  'name',
  'verbose',
]);

export function extractSchematicOptions(
  argv: string[]
): Record<string, unknown> {
  const commandIndex = argv.findIndex((arg) => arg === 'generate');
  if (commandIndex === -1) {
    return {};
  }

  let index = commandIndex + 1;
  if (argv[index] && !argv[index].startsWith('-')) {
    index += 1;
  }

  const extracted: Record<string, unknown> = {};

  while (index < argv.length) {
    const arg = argv[index];
    if (!arg.startsWith('-')) {
      index += 1;
      continue;
    }

    if (arg === '--') {
      break;
    }

    if (arg.startsWith('--')) {
      const [rawName, inlineValue] = arg.slice(2).split('=', 2);
      const optionName = toCamelCase(rawName);

      if (knownOptionNames.has(rawName) || knownOptionNames.has(optionName)) {
        index +=
          inlineValue === undefined &&
          argv[index + 1] &&
          !argv[index + 1].startsWith('-')
            ? 2
            : 1;
        continue;
      }

      if (inlineValue !== undefined) {
        extracted[optionName] = parseSchematicValue(inlineValue);
        index += 1;
        continue;
      }

      const nextArg = argv[index + 1];
      if (nextArg && !nextArg.startsWith('-')) {
        extracted[optionName] = parseSchematicValue(nextArg);
        index += 2;
        continue;
      }

      extracted[optionName] = true;
      index += 1;
      continue;
    }

    index += 1;
  }

  return extracted;
}

export function removeUnsetOptions(
  options: Record<string, unknown>
): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

function parseSchematicValue(raw: string): unknown {
  if (raw === 'true') {
    return true;
  }
  if (raw === 'false') {
    return false;
  }
  return raw;
}

function toCamelCase(value: string): string {
  return value.replace(/-([a-z])/g, (_, letter: string) =>
    letter.toUpperCase()
  );
}
