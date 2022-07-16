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
});
