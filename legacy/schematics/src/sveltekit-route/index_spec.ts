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

describe('sveltekit-route', () => {
  it('works', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic(
      'sveltekit-route',
      { name: 'tester' },
      ftree
    );
    assertSameMembers(tree.files, [
      '/src/routes/tester/+page.svelte',
      '/tests/tester.spec.ts',
    ]);
    assert.ok(
      tree
        .readContent('/src/routes/tester/+page.svelte')
        .includes("$state('tester route')")
    );
  });
});

describe('sveltekit-route with server load', () => {
  it('works', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic(
      'sveltekit-route',
      { name: 'tester', load: 'server' },
      ftree
    );
    assertSameMembers(tree.files, [
      '/src/routes/tester/+page.svelte',
      '/src/routes/tester/+page.server.ts',
      '/tests/tester.spec.ts',
    ]);
  });

  it('works with project root', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic(
      'sveltekit-route',
      { name: 'a/b/c/tester', projectRoot: 'apps/fun' },
      ftree
    );
    assertSameMembers(tree.files, [
      '/apps/fun/src/routes/a/b/c/tester/+page.svelte',
      '/apps/fun/tests/a/b/c/tester.spec.ts',
    ]);

    assert.ok(
      tree
        .readContent('/apps/fun/tests/a/b/c/tester.spec.ts')
        .includes("await page.goto('/a/b/c/tester');")
    );
  });
});

describe('sveltekit-route skipTests', () => {
  it('works', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic(
      'sveltekit-route',
      { name: 'tester', skipTests: true },
      ftree
    );
    assertSameMembers(tree.files, ['/src/routes/tester/+page.svelte']);
  });
});

describe('sveltekit-route with path', () => {
  it('works', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic(
      'sveltekit-route',
      { name: 'a/b/c/tester', load: 'none', path: 'tbd' },
      ftree
    );
    assertSameMembers(tree.files, [
      '/src/routes/tbd/a/b/c/tester/+page.svelte',
      '/tests/tbd/a/b/c/tester.spec.ts',
    ]);

    assert.ok(
      tree
        .readContent('/tests/tbd/a/b/c/tester.spec.ts')
        .includes("await page.goto('/tbd/a/b/c/tester');")
    );
  });

  it('works with project root', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic(
      'sveltekit-route',
      {
        name: 'a/b/c/tester',
        load: 'none',
        path: 'tbd',
        projectRoot: 'apps/fun',
      },
      ftree
    );
    assertSameMembers(tree.files, [
      '/apps/fun/src/routes/tbd/a/b/c/tester/+page.svelte',
      '/apps/fun/tests/tbd/a/b/c/tester.spec.ts',
    ]);

    assert.ok(
      tree
        .readContent('/apps/fun/tests/tbd/a/b/c/tester.spec.ts')
        .includes("await page.goto('/tbd/a/b/c/tester');")
    );
  });
});
