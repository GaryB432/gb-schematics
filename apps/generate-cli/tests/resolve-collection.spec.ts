import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { resolveCollection } from '../src/resolve-collection.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const fixturesDir = join(__dirname, 'fixtures');

describe('resolveCollection', () => {
  describe('local path resolution', () => {
    it('resolves a collection by absolute path', async () => {
      const result = await resolveCollection(
        join(fixturesDir, 'test-collection')
      );

      expect(result.collection.schematics).toHaveProperty('module');
      expect(result.collection.schematics['module']).toMatchObject({
        schema: './module/schema.json',
        factory: './module',
      });
    });

    it('resolves a collection by relative path (from cwd)', async () => {
      // We use the absolute path here but verify the returned packageRoot
      const absPath = join(fixturesDir, 'test-collection');
      const result = await resolveCollection(absPath);

      expect(result.packageRoot).toBe(absPath);
    });

    it('sets collectionDir to the directory containing collection.json', async () => {
      const absPath = join(fixturesDir, 'test-collection');
      const result = await resolveCollection(absPath);

      // schematics field is "./collection.json" so collectionDir == packageRoot
      expect(result.collectionDir).toBe(absPath);
    });

    it('lists all schematics from the collection', async () => {
      const result = await resolveCollection(
        join(fixturesDir, 'test-collection')
      );

      expect(Object.keys(result.collection.schematics)).toEqual([
        'module',
        'component',
      ]);
    });
  });

  describe('error handling', () => {
    it('throws when the package has no "schematics" field', async () => {
      await expect(
        resolveCollection(join(fixturesDir, 'no-schematics-collection'))
      ).rejects.toThrow('"schematics" field');
    });

    it('throws when the package directory does not exist', async () => {
      await expect(
        resolveCollection(join(fixturesDir, 'nonexistent-package'))
      ).rejects.toThrow();
    });

    it('throws a descriptive error for missing npm packages', async () => {
      await expect(
        resolveCollection('@nonexistent/totally-fake-package-xyz')
      ).rejects.toThrow('Cannot find collection package');
    });
  });
});
