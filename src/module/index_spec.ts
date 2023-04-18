import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { parseName } from '.';
import { Options } from './schema';

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
        { name: 'tester', unitTestRunner: 'none' },
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
    const fcontent = tree.readContent('/src/Tester.spec.ts');
    expect(fcontent).toContain("import { Tester } from './Tester';");
    expect(fcontent).not.toContain(
      "import { describe, expect, test } from 'vitest';"
    );
  });

  it('handles vitest', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner
      .runSchematicAsync<Options>(
        'module',
        { name: 'tester', kind: 'class', unitTestRunner: 'vitest' },
        ftree
      )
      .toPromise();

    expect(tree.files).toEqual(['/src/Tester.spec.ts', '/src/Tester.ts']);
    const fcontent = tree.readContent('/src/Tester.spec.ts');
    expect(fcontent).toContain(
      "import { describe, expect, test } from 'vitest';"
    );
    expect(fcontent).toContain("import { Tester } from './Tester';");
  });

  it('imports from correct file', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner
      .runSchematicAsync<Options>(
        'module',
        { name: 'tester', kind: 'values' },
        ftree
      )
      .toPromise();

    expect(tree.files).toEqual(['/src/tester.spec.ts', '/src/tester.ts']);
    const fcontent = tree.readContent('/src/tester.spec.ts');
    expect(fcontent).not.toContain("from './Tester'");
    expect(fcontent).toContain(
      "import { add, greet, meaning } from './tester';"
    );
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

  it('works with project root and path', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner
      .runSchematicAsync<Options>(
        'module',
        {
          name: 'banana',
          directory: 'abc/def',
          kind: undefined,
          unitTestRunner: 'none',
          sourceRoot: 'test/root/src',
        },
        ftree
      )
      .toPromise();

    expect(tree.files).toContain('/test/root/src/abc/def/banana.ts');
  });
});

describe('utility functions', () => {
  it('parseName', () => {
    expect(parseName('a/b/c/d', 'asdf/l/mnop/some.doc')).toEqual({
      name: 'some.doc',
      path: '/a/b/c/d/asdf/l/mnop',
    });
  });
  it('parseName slash', () => {
    expect(parseName('/a/b/c/d/', 'asdf/l/mnop/some.doc')).toEqual({
      name: 'some.doc',
      path: '/a/b/c/d/asdf/l/mnop',
    });
  });
});
