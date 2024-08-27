import { Tree } from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../collection.json');

describe('eslint', () => {
  let tree: UnitTestTree;
  beforeEach(async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    ftree.create(
      'package.json',
      JSON.stringify({ name: 'test', version: '1.2.3' })
    );
    tree = await runner.runSchematic('eslint', {}, ftree);
  });
  it('works', async () => {
    expect(tree.files).toContain('/eslint.config.mjs');
  });
  it('adds dependencies', () => {
    const pJ = tree.readJson('package.json') as {
      devDependencies: Record<string, unknown>;
      peerDependencies: Record<string, unknown>;
    };
    expect(Object.keys(pJ.peerDependencies)).toBeDefined();
    // expect(Object.keys(pJ.devDependencies)).toEqual([
    //   '@eslint/js',
    //   '@types/eslint__js',
    //   'eslint',
    //   'eslint-plugin-gb',
    //   'typescript-eslint',
    //   'typescript',
    //   'prettier',
    // ]);

    // expect(2 + 2).toEqual(5);
  });
});
