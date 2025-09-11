import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import * as jasmine from '../utility/fake/jasmine';

const collectionPath = path.join(__dirname, '../collection.json');

describe('sveltekit-route', () => {
  it('works', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic(
      'sveltekit-route',
      { name: 'tester' },
      ftree
    );
    expect(tree.files).toEqual(
      jasmine.arrayWithExactContents([
        '/src/routes/tester/+page.svelte',
        // '/src/routes/tester/+page.ts',
        '/tests/tester.spec.ts',
      ])
    );
    expect(tree.readContent('/src/routes/tester/+page.svelte')).toContain(
      "$state('tester route')"
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
    expect(tree.files).toEqual(
      jasmine.arrayWithExactContents([
        '/src/routes/tester/+page.server.ts',
        '/src/routes/tester/+page.svelte',
        '/tests/tester.spec.ts',
      ])
    );
  });

  it('works with project root', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic(
      'sveltekit-route',
      { name: 'a/b/c/tester', projectRoot: 'apps/fun' },
      ftree
    );
    expect(tree.files).toEqual(
      jasmine.arrayWithExactContents([
        '/apps/fun/src/routes/a/b/c/tester/+page.svelte',
        // '/apps/fun/src/routes/a/b/c/tester/+page.ts',
        '/apps/fun/tests/a/b/c/tester.spec.ts',
      ])
    );

    expect(tree.readContent('/apps/fun/tests/a/b/c/tester.spec.ts')).toContain(
      "await page.goto('/a/b/c/tester');"
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
    expect(tree.files).toEqual(
      jasmine.arrayWithExactContents([
        '/src/routes/tester/+page.svelte',
        // '/src/routes/tester/+page.ts',
      ])
    );
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
    expect(tree.files).toEqual(
      jasmine.arrayWithExactContents([
        '/src/routes/tbd/a/b/c/tester/+page.svelte',
        // '/src/routes/tbd/a/b/c/tester/+page.ts',
        '/tests/tbd/a/b/c/tester.spec.ts',
      ])
    );

    expect(tree.readContent('/tests/tbd/a/b/c/tester.spec.ts')).toContain(
      "await page.goto('/tbd/a/b/c/tester');"
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
    expect(tree.files).toEqual(
      jasmine.arrayWithExactContents([
        '/apps/fun/src/routes/tbd/a/b/c/tester/+page.svelte',
        // '/apps/fun/src/routes/tbd/a/b/c/tester/+page.ts',
        '/apps/fun/tests/tbd/a/b/c/tester.spec.ts',
      ])
    );

    expect(
      tree.readContent('/apps/fun/tests/tbd/a/b/c/tester.spec.ts')
    ).toContain("await page.goto('/tbd/a/b/c/tester');");
  });
});
