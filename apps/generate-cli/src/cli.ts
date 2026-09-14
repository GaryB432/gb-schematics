import { intro, log, note, outro } from '@clack/prompts';
import { cac } from 'cac';
import { resolveCollection } from './resolve-collection.js';
import { resolveSchema } from './resolve-schema.js';

const cli = cac('generate');

cli
  .command('<schematic>', 'Run a schematic from the resolved collection')
  .option(
    '--collection <name>',
    'Collection package name or local path (default: @gb-schematics/schematics)',
    { default: '@gb-schematics/schematics' }
  )
  .option('--name <name>', 'Name of the item to generate')
  .option('--kind <kind>', 'Kind of item (e.g. class | values)')
  .option('--directory <path>', 'Directory to create the files in')
  .option('--source-root <path>', 'Project source root path')
  .option('--dry-run', 'Run without creating files')
  .option('--verbose', 'Show verbose debug output')
  .action(async (schematic: string, flags: Record<string, unknown>) => {
    const collectionName = flags['collection'] as string;
    const verbose = Boolean(flags['verbose']);

    intro(`generate — Milestone 1`);

    try {
      const resolved = await resolveCollection(collectionName);

      const entry = resolved.collection.schematics[schematic];
      if (!entry) {
        const available = Object.keys(
          resolved.collection.schematics
        ).join(', ');
        log.error(
          `Unknown schematic "${schematic}". Available: ${available}`
        );
        process.exit(1);
      }

      const schema = await resolveSchema(resolved.collectionDir, entry.schema);

      const properties = schema.properties ?? {};
      const required = schema.required ?? [];
      const xPrompts: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(properties)) {
        if (v['x-prompt'] !== undefined) {
          xPrompts[k] = v['x-prompt'];
        }
      }

      note(
        [
          `Collection : ${collectionName}`,
          `Package    : ${resolved.packageRoot}`,
          `Schematic  : ${schematic}`,
          `Schema     : ${entry.schema}`,
          `Properties : ${Object.keys(properties).join(', ')}`,
          `Required   : ${required.join(', ') || '(none)'}`,
          `x-prompts  : ${Object.keys(xPrompts).join(', ') || '(none)'}`,
        ].join('\n'),
        'Resolved schema summary'
      );

      if (verbose) {
        log.info('Full schema properties:');
        for (const [name, prop] of Object.entries(properties)) {
          const parts: string[] = [];
          if (prop.type) {
            parts.push(`type=${Array.isArray(prop.type) ? prop.type.join('|') : prop.type}`);
          }
          if (prop.enum) {
            parts.push(`enum=[${prop.enum.join(', ')}]`);
          }
          if (prop.default !== undefined) {
            parts.push(`default=${String(prop.default)}`);
          }
          if (prop['x-prompt']) {
            const msg =
              typeof prop['x-prompt'] === 'string'
                ? prop['x-prompt']
                : prop['x-prompt'].message ?? '';
            parts.push(`x-prompt="${msg}"`);
          }
          log.info(`  ${name}: ${parts.join(', ')}`);
        }
      }

      outro('Collection & schema resolved successfully (Milestone 1 ✓)');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : String(error);
      log.error(message);
      if (verbose && error instanceof Error && error.stack) {
        log.error(error.stack);
      }
      process.exit(1);
    }
  });

cli.help();

cli.on('command:*', () => {
  console.error(`Unknown command: ${cli.args.join(' ')}`);
  console.error('Run with --help to see available options.');
  process.exit(1);
});

cli.parse();
