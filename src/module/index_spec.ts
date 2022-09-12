import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { Options } from './schema';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../collection.json');

describe('module', () => {
  it('works', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner
      .runSchematicAsync<Options>('module', { name: 'tester' }, ftree)
      .toPromise();

    expect(tree.files).toEqual(['/src/tester.spec.ts', '/src/tester.ts']);
  });

  it('skips tests', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner
      .runSchematicAsync<Options>(
        'module',
        { name: 'tester', skipTests: true },
        ftree
      )
      .toPromise();

    expect(tree.files).not.toContain('/tester.spec.ts');
  });

  it('classifies', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner
      .runSchematicAsync<Options>(
        'module',
        { name: 'tester', kind: 'class' },
        ftree
      )
      .toPromise();

    expect(tree.files).toEqual(['/src/Tester.spec.ts', '/src/Tester.ts']);
  });

  it('works with directory', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner
      .runSchematicAsync<Options>(
        'module',
        { name: 'tester', directory: 'a/b/c/d' },
        ftree
      )
      .toPromise();

    expect(tree.files).toContain('/src/a/b/c/d/tester.ts');
  });

  it('works with path name', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner
      .runSchematicAsync<Options>(
        'module',
        { name: 'c/d/tester', directory: 'a/b' },
        ftree
      )
      .toPromise();

    expect(tree.files).toContain('/src/a/b/c/d/tester.ts');
  });

  it('works with project root', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner
      .runSchematicAsync<Options>(
        'module',
        {
          name: 'tester',
          directory: 'a/b/c/d',
          sourceRoot: 'apps/project/src',
        },
        ftree
      )
      .toPromise();

    expect(tree.files).toContain('/apps/project/src/a/b/c/d/tester.ts');
  });

  it('works with project root and path', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner
      .runSchematicAsync<Options>(
        'module',
        {
          name: 'c/d/tester',
          directory: 'a/b',
          sourceRoot: 'apps/project/src',
        },
        ftree
      )
      .toPromise();

    expect(tree.files).toContain('/apps/project/src/a/b/c/d/tester.ts');
  });
});
