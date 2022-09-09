import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../collection.json');

describe('sveltekit-component', () => {
  it('works', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner
      .runSchematicAsync('sveltekit-component', { name: 'tester' }, ftree)
      .toPromise();

    expect(tree.files).toEqual(['/src/lib/components/Tester.svelte']);
  });

  it('works with directory', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner
      .runSchematicAsync(
        'sveltekit-component',
        { name: 'tester', directory: 'a/b/c/d' },
        ftree
      )
      .toPromise();

    expect(tree.files).toEqual(['/src/a/b/c/d/Tester.svelte']);
  });

  it('works with path name', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner
      .runSchematicAsync(
        'sveltekit-component',
        { name: 'c/d/tester', directory: 'a/b' },
        ftree
      )
      .toPromise();

    expect(tree.files).toEqual(['/src/a/b/c/d/Tester.svelte']);
  });

  it('works with project root', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner
      .runSchematicAsync(
        'sveltekit-component',
        { name: 'tester', directory: 'a/b/c/d', projectRoot: 'apps/project' },
        ftree
      )
      .toPromise();

    expect(tree.files).toEqual(['/apps/project/src/a/b/c/d/Tester.svelte']);
  });

  it('works with project root and path', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner
      .runSchematicAsync(
        'sveltekit-component',
        { name: 'c/d/tester', directory: 'a/b', projectRoot: 'apps/project' },
        ftree
      )
      .toPromise();

    expect(tree.files).toEqual(['/apps/project/src/a/b/c/d/Tester.svelte']);
  });
});
