import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing/index.js';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function assertSameMembers(actual: string[], expected: string[]) {
  assert.deepEqual([...actual].sort(), [...expected].sort());
}

const collectionPath = path.join(__dirname, '../../dist/collection.json');

describe('sveltekit-component', () => {
  it('works', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic(
      'sveltekit-component',
      { name: 'tester' },
      ftree
    );
    assertSameMembers(tree.files, ['/src/lib/components/Tester.svelte']);
    assert.ok(
      !tree
        .readContent('/src/lib/components/Tester.svelte')
        .includes('export let')
    );
  });

  it('works with directory', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic(
      'sveltekit-component',
      { name: 'tester', directory: 'a/b/c/d' },
      ftree
    );
    assertSameMembers(tree.files, ['/src/a/b/c/d/Tester.svelte']);
  });

  it('works with path name', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic(
      'sveltekit-component',
      { name: 'c/d/tester', directory: 'a/b' },
      ftree
    );
    assertSameMembers(tree.files, ['/src/a/b/c/d/Tester.svelte']);
  });

  it('works with project root', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic(
      'sveltekit-component',
      { name: 'tester', directory: 'a/b/c/d', projectRoot: 'apps/project' },
      ftree
    );
    assertSameMembers(tree.files, ['/apps/project/src/a/b/c/d/Tester.svelte']);
  });

  it('works with project root and path', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic(
      'sveltekit-component',
      { name: 'c/d/tester', directory: 'a/b', projectRoot: 'apps/project' },
      ftree
    );
    assertSameMembers(tree.files, ['/apps/project/src/a/b/c/d/Tester.svelte']);
  });
});
