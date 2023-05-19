import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../collection.json');

describe('eslint', () => {
  it('works', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    ftree.create(
      'package.json',
      JSON.stringify({ name: 'test', version: '1.2.3' })
    );
    const tree = await runner.runSchematic('eslint', {}, ftree);
    expect(tree.files).toContain('/.eslintrc.js');
  });
});
