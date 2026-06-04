import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing/index.js';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';
import type { Options } from './schema.generated.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function assertSameMembers(actual: string[], expected: string[]) {
  assert.deepEqual([...actual].sort(), [...expected].sort());
}

const collectionPath = path.join(__dirname, '../../dist/collection.json');

describe('module', () => {
  it('works', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic<Options>(
      'module',
      { name: 'tester' },
      ftree,
    );

    assertSameMembers(tree.files, ['/tester.spec.ts', '/tester.ts']);
  });

  it('skips tests', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic<Options>(
      'module',
      { name: 'tester', unitTestRunner: 'none' },
      ftree,
    );
    assert.ok(!tree.files.includes('/tester.spec.ts'));
  });

  it('classifies', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic<Options>(
      'module',
      { name: 'tester', kind: 'class', sourceRoot: 'src' },
      ftree,
    );
    assertSameMembers(tree.files, ['/src/Tester.spec.ts', '/src/Tester.ts']);
    const fcontent = tree.readContent('/src/Tester.spec.ts');
    assert.ok(fcontent.includes("import { Tester } from './Tester';"));
    assert.ok(
      !fcontent.includes("import { describe, expect, test } from 'vitest';"),
    );
  });

  it('does not classify', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic<Options>(
      'module',
      {
        name: 'ProjectNamedTester',
        kind: 'class',
        sourceRoot: 'src',
        pascalCaseFiles: false,
      },
      ftree,
    );
    assertSameMembers(tree.files, [
      '/src/project-named-tester.spec.ts',
      '/src/project-named-tester.ts',
    ]);
    const fcontent = tree.readContent('/src/project-named-tester.spec.ts');
    assert.ok(
      fcontent.includes(
        "import { ProjectNamedTester } from './project-named-tester';",
      ),
    );
    assert.ok(!fcontent.includes("} from 'vitest';"));

    assert.match(fcontent, /let projectNamedTester: ProjectNamedTester/);
    assert.match(
      tree.readContent('/src/project-named-tester.ts'),
      /: (string|number)/,
    );
  });

  it('handles vitest', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic<Options>(
      'module',
      {
        name: 'tester',
        kind: 'class',
        unitTestRunner: 'vitest',
        sourceRoot: 'src',
      },
      ftree,
    );
    assertSameMembers(tree.files, ['/src/Tester.spec.ts', '/src/Tester.ts']);
    const fcontent = tree.readContent('/src/Tester.spec.ts');
    assert.ok(
      fcontent.includes(
        "import { beforeEach, describe, expect, test } from 'vitest';",
      ),
    );
    assert.ok(fcontent.includes("import { Tester } from './Tester';"));
  });

  it('imports from correct file', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic<Options>(
      'module',
      { name: 'tester', kind: 'values', sourceRoot: 'src' },
      ftree,
    );
    assertSameMembers(tree.files, ['/src/tester.spec.ts', '/src/tester.ts']);
    const fcontent = tree.readContent('/src/tester.spec.ts');
    assert.ok(!fcontent.includes("from './Tester'"));
    assert.ok(
      fcontent.includes("import { add, greet, meaning } from './tester';"),
    );
  });

  it('works with directory', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic<Options>(
      'module',
      { name: 'tester', directory: 'a/b/c/d' },
      ftree,
    );
    assert.ok(tree.files.includes('/a/b/c/d/tester.ts'));
  });

  it('works with path name (without sourceRoot)', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic<Options>(
      'module',
      { name: 'c/d/tester', directory: 'a/b' },
      ftree,
    );
    assert.ok(tree.files.includes('/a/b/c/d/tester.ts'));
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
      ftree,
    );
    assert.ok(tree.files.includes('/apps/project/src/a/b/c/d/tester.ts'));
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
      ftree,
    );
    assert.ok(tree.files.includes('/apps/project/src/a/b/c/d/tester.ts'));
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
        unitTestRunner: 'none',
        sourceRoot: 'test/root/src',
      },
      ftree,
    );
    assert.ok(tree.files.includes('/test/root/src/abc/def/banana.ts'));
  });
});

describe('js module', () => {
  it('makes class', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic<Options>(
      'module',
      { name: 'tester', language: 'js' },
      ftree,
    );
    assertSameMembers(tree.files, ['/tester.spec.js', '/tester.js']);
    assert.ok(
      tree
        .read('/tester.spec.js')
        ?.toString()
        .includes("import { add, greet, meaning } from './tester.js';"),
    );
    assert.ok(
      tree
        .read('/tester.js')
        ?.toString()
        .includes('export function greet(name) {'),
    );
    assert.doesNotMatch(tree.readContent('/tester.js'), /: ^4/);
  });

  it('makes values', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner.runSchematic<Options>(
      'module',
      { name: 'tester', language: 'js', kind: 'values' },
      ftree,
    );
    assertSameMembers(tree.files, ['/tester.spec.js', '/tester.js']);
    assert.ok(
      tree
        .readContent('/tester.spec.js')
        .includes("import { add, greet, meaning } from './tester.js';"),
    );
    assert.doesNotMatch(tree.readContent('/tester.js'), /: (string|number)/);
  });
});
