import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { extractSchematicOptions, removeUnsetOptions } from './argv-options.js';

describe('argv-options', () => {
  describe('removeUnsetOptions', () => {
    it('drops only undefined values', () => {
      const result = removeUnsetOptions({
        collection: '',
        count: 0,
        dryRun: false,
        force: false,
        name: undefined,
      });

      assert.deepEqual(result, {
        collection: '',
        count: 0,
        dryRun: false,
        force: false,
      });
    });
  });

  describe('extractSchematicOptions', () => {
    it('extracts unknown long-form flags after generate schematic', () => {
      const argv = [
        'generate',
        'sveltekit-component',
        '--name',
        'Widget',
        '--directory=src/lib',
      ];
      const result = extractSchematicOptions(argv);

      assert.deepEqual(result, {
        directory: 'src/lib',
      });
    });

    it('parses boolean-like string values for unknown flags', () => {
      const argv = [
        'generate',
        'module',
        '--flat',
        'true',
        '--skip-tests=false',
      ];
      const result = extractSchematicOptions(argv);

      assert.deepEqual(result, {
        flat: true,
        skipTests: false,
      });
    });

    it('ignores known cli options and stops at passthrough separator', () => {
      const argv = [
        'generate',
        'module',
        '--collection',
        '@gb-schematics/schematics',
        '--verbose',
        '--name',
        'Thing',
        '--directory',
        'src/lib',
        '--',
        '--ignored',
      ];
      const result = extractSchematicOptions(argv);

      assert.deepEqual(result, {
        directory: 'src/lib',
      });
    });
  });
});
