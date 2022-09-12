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

    expect(tree.files).toEqual(['/tester.spec.ts', '/tester.ts']);
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

    expect(tree.files).toEqual(['/Tester.spec.ts', '/Tester.ts']);
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

    expect(tree.files).toContain('/a/b/c/d/tester.ts');
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

    expect(tree.files).toContain('/a/b/c/d/tester.ts');
  });

  it('works with project root', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner
      .runSchematicAsync<Options>(
        'module',
        { name: 'tester', directory: 'a/b/c/d', projectRoot: 'apps/project' },
        ftree
      )
      .toPromise();

    expect(tree.files).toContain('/apps/project/a/b/c/d/tester.ts');
  });

  it('works with project root and path', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner
      .runSchematicAsync<Options>(
        'module',
        { name: 'c/d/tester', directory: 'a/b', projectRoot: 'apps/project' },
        ftree
      )
      .toPromise();

    expect(tree.files).toContain('/apps/project/a/b/c/d/tester.ts');
  });
});
