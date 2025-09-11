import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import * as jasmine from '../utility/fake/jasmine';
import { Kind, Language, UnitTestRunner, type Schema as Options } from './schema';

const collectionPath = path.join(__dirname, '../collection.json');

describe('module', () => {
  it('works', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic<Options>(
      'module',
      { name: 'tester' },
      ftree
    );

    expect(tree.files).toEqual(
      jasmine.arrayWithExactContents(['/tester.ts', '/tester.spec.ts'])
    );
  });

  it('skips tests', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic<Options>(
      'module',
      { name: 'tester', unitTestRunner: UnitTestRunner.none },
      ftree
    );
    expect(tree.files).not.toContain('/tester.spec.ts');
  });

  it('classifies', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic<Options>(
      'module',
      { name: 'tester', kind: Kind.class, sourceRoot: 'src' },
      ftree
    );
    expect(tree.files).toEqual(
      jasmine.arrayWithExactContents(['/src/Tester.ts', '/src/Tester.spec.ts'])
    );
    const fcontent = tree.readContent('/src/Tester.spec.ts');
    expect(fcontent).toContain("import { Tester } from './Tester';");
    expect(fcontent).not.toContain(
      "import { describe, expect, test } from 'vitest';"
    );
  });

  it('does not classify', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic<Options>(
      'module',
      {
        name: 'ProjectNamedTester',
        kind: Kind.class,
        sourceRoot: 'src',
        pascalCaseFiles: false,
      },
      ftree
    );
    expect(tree.files).toEqual(
      jasmine.arrayWithExactContents([
        '/src/project-named-tester.ts',
        '/src/project-named-tester.spec.ts',
      ])
    );
    const fcontent = tree.readContent('/src/project-named-tester.spec.ts');
    expect(fcontent).toContain(
      "import { ProjectNamedTester } from './project-named-tester';"
    );
    expect(fcontent).not.toContain("} from 'vitest';");

    expect(fcontent).toMatch(/let projectNamedTester: ProjectNamedTester/);
    expect(tree.readContent('/src/project-named-tester.ts')).toMatch(
      /: (string|number)/
    );
  });

  it('handles vitest', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic<Options>(
      'module',
      {
        name: 'tester',
        kind: Kind.class,
        unitTestRunner: UnitTestRunner.vitest,
        sourceRoot: 'src',
      },
      ftree
    );
    expect(tree.files).toEqual(
      jasmine.arrayWithExactContents(['/src/Tester.ts', '/src/Tester.spec.ts'])
    );
    const fcontent = tree.readContent('/src/Tester.spec.ts');
    expect(fcontent).toContain(
      "import { beforeEach, describe, expect, test } from 'vitest';"
    );
    expect(fcontent).toContain("import { Tester } from './Tester';");
  });

  it('imports from correct file', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic<Options>(
      'module',
      { name: 'tester', kind: Kind.values, sourceRoot: 'src' },
      ftree
    );
    expect(tree.files).toEqual(
      jasmine.arrayWithExactContents(['/src/tester.ts', '/src/tester.spec.ts'])
    );
    const fcontent = tree.readContent('/src/tester.spec.ts');
    expect(fcontent).not.toContain("from './Tester'");
    expect(fcontent).toContain(
      "import { add, greet, meaning } from './tester';"
    );
  });

  it('works with directory', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic<Options>(
      'module',
      { name: 'tester', directory: 'a/b/c/d' },
      ftree
    );
    expect(tree.files).toContain('/a/b/c/d/tester.ts');
  });

  it('works with path name (without sourceRoot)', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic<Options>(
      'module',
      { name: 'c/d/tester', directory: 'a/b' },
      ftree
    );
    expect(tree.files).toContain('/a/b/c/d/tester.ts');
  });

  it('works with project root', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic<Options>(
      'module',
      {
        name: 'tester',
        directory: 'a/b/c/d',
        sourceRoot: 'apps/project/src',
      },
      ftree
    );
    expect(tree.files).toContain('/apps/project/src/a/b/c/d/tester.ts');
  });

  it('works with project root and path', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic<Options>(
      'module',
      {
        name: 'c/d/tester',
        directory: 'a/b',
        sourceRoot: 'apps/project/src',
      },
      ftree
    );
    expect(tree.files).toContain('/apps/project/src/a/b/c/d/tester.ts');
  });

  it('works with project root and path', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic<Options>(
      'module',
      {
        name: 'banana',
        directory: 'abc/def',
        kind: undefined,
        unitTestRunner: UnitTestRunner.none,
        sourceRoot: 'test/root/src',
      },
      ftree
    );
    expect(tree.files).toContain('/test/root/src/abc/def/banana.ts');
  });
});

describe('js module', () => {
  it('makes class', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic<Options>(
      'module',
      { name: 'tester', language: Language.js },
      ftree
    );
    expect(tree.files).toEqual(
      jasmine.arrayWithExactContents(['/tester.js', '/tester.spec.js'])
    );
    expect(tree.read('/tester.spec.js')?.toString()).toContain(
      "import { add, greet, meaning } from './tester.js';"
    );
    expect(tree.read('/tester.js')?.toString()).toContain(
      'export function greet(name) {'
    );
    expect(tree.readContent('/tester.js')).not.toMatch(/: ^4/);
  });

  it('makes values', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic<Options>(
      'module',
      { name: 'tester', language: Language.js, kind: Kind.values },
      ftree
    );
    expect(tree.files).toEqual(
      jasmine.arrayWithExactContents(['/tester.js', '/tester.spec.js'])
    );
    expect(tree.readContent('/tester.spec.js')).toContain(
      "import { add, greet, meaning } from './tester.js';"
    );
    expect(tree.readContent('/tester.js')).not.toMatch(/: (string|number)/);
  });
});
