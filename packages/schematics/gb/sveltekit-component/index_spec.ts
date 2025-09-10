import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import * as jasmine from '../utility/fake/jasmine';


const collectionPath = path.join(__dirname, '../collection.json');

describe('sveltekit-component', () => {
  it('works', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic(
      'sveltekit-component',
      { name: 'tester' },
      ftree
    );
    expect(tree.files).toEqual(
      jasmine.arrayWithExactContents(['/src/lib/components/Tester.svelte'])
    );
    expect(tree.readContent('/src/lib/components/Tester.svelte')).not.toContain(
      'export let'
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
    expect(tree.files).toEqual(
      jasmine.arrayWithExactContents(['/src/a/b/c/d/Tester.svelte'])
    );
  });

  it('works with path name', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic(
      'sveltekit-component',
      { name: 'c/d/tester', directory: 'a/b' },
      ftree
    );
    expect(tree.files).toEqual(
      jasmine.arrayWithExactContents(['/src/a/b/c/d/Tester.svelte'])
    );
  });

  it('works with project root', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic(
      'sveltekit-component',
      { name: 'tester', directory: 'a/b/c/d', projectRoot: 'apps/project' },
      ftree
    );
    expect(tree.files).toEqual(
      jasmine.arrayWithExactContents([
        '/apps/project/src/a/b/c/d/Tester.svelte',
      ])
    );
  });

  it('works with project root and path', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic(
      'sveltekit-component',
      { name: 'c/d/tester', directory: 'a/b', projectRoot: 'apps/project' },
      ftree
    );
    expect(tree.files).toEqual(
      jasmine.arrayWithExactContents([
        '/apps/project/src/a/b/c/d/Tester.svelte',
      ])
    );
  });
});
