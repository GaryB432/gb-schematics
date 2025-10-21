import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../collection.json');

describe('bump', () => {
  it('works', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    ftree.create(
      'package.json',
      JSON.stringify({ name: 'test', version: '1.2.3' }),
    );
    const tree = await runner.runSchematic('bump', { part: 'major' }, ftree);
    const buff = tree.read('package.json');

    const newPJ = buff ? JSON.parse(buff.toString()) : {};

    expect(newPJ.version).toBe('2.0.0');
  });
});
