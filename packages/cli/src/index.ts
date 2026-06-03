#!/usr/bin/env node

import { cac } from 'cac';

import { runSchematic } from './run-schematic.js';
import { version } from './version.js';

const cli = cac('gb-schematics-cli');

const knownOptionNames = new Set([
  'collection',
  'name',
  'dryRun',
  'force',
  'verbose',
  'c',
  'n',
  'dry-run',
  'dryrun',
]);

function toCamelCase(value: string): string {
  return value.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
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

function extractSchematicOptions(argv: string[]): Record<string, unknown> {
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
          inlineValue === undefined && argv[index + 1] && !argv[index + 1].startsWith('-') ? 2 : 1;
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

cli
  .command('generate [schematic]', 'Run a schematic')
  .allowUnknownOptions()
  .option('-c, --collection <collection>', 'Schematic collection name', {
    default: '@gb-schematics/schematics',
  })
  .option('-n, --name <name>', 'Name for the schematic (e.g., component name)')
  .option('--dry-run', 'Run without creating files', {
    default: false,
  })
  .option('--force', 'Force overwriting files', {
    default: false,
  })
  .option('--verbose', 'Show extra logs', {
    default: false,
  })
  .action((schematic: string, options: any) => {
    const schematicOptions = extractSchematicOptions(process.argv.slice(2));
    return runSchematic({
      ...options,
      ...schematicOptions,
      schematic,
    });
  });

cli.version(version, '-v, --version');
cli.help();

cli.on('command:*', () => {
  console.error(`Unknown command: ${cli.args.join(' ')}`);
  console.error('Use --help to see available commands and options.');
  process.exit(1);
});

const userArgs = process.argv.slice(2);
const hasHelpOrVersionFlag = userArgs.some((arg) =>
  ['-h', '--help', '-v', '--version'].includes(arg),
);

if (!hasHelpOrVersionFlag && (!userArgs[0] || userArgs[0].startsWith('-'))) {
  console.error('Missing command. Use "generate [schematic]".');
  console.error('Use --help to see available commands and options.');
  process.exit(1);
}

cli.parse();
