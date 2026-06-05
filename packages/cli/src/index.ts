#!/usr/bin/env node

/* eslint @typescript-eslint/no-explicit-any: 1 */

import { cac } from 'cac';

import { extractSchematicOptions, removeUnsetOptions } from './argv-options.js';
import { runSchematic } from './run-schematic.js';
import { version } from './version.js';

const cli = cac('gb-schematics-cli');

cli
  .command('generate [schematic]', 'Run a schematic')
  .allowUnknownOptions()
  .option('-c, --collection <collection>', 'Schematic collection name')
  .option('-n, --name <name>', 'Name for the schematic (e.g., component name)')
  .option('--dry-run', 'Run without creating files')
  .option('--force', 'Force overwriting files')
  .option('--verbose', 'Show extra logs')
  .action((schematic: string, options: unknown) => {
    const schematicOptions = extractSchematicOptions(process.argv.slice(2));
    const cleanedOptions = removeUnsetOptions(
      options as Record<string, unknown>
    );

    return runSchematic({
      ...cleanedOptions,
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
  ['--help', '--version', '-h', '-v'].includes(arg)
);

if (!hasHelpOrVersionFlag && (!userArgs[0] || userArgs[0].startsWith('-'))) {
  console.error('Missing command. Use "generate [schematic]".');
  console.error('Use --help to see available commands and options.');
  process.exit(1);
}

cli.parse();
