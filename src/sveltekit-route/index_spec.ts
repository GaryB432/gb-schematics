import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../collection.json');

describe('sveltekit-route', () => {
  it('works', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner
      .runSchematicAsync('sveltekit-route', { name: 'tester' }, ftree)
      .toPromise();

    expect(tree.files).toEqual([
      '/src/routes/tester/index.svelte',
      '/src/routes/tester/index.ts',
      '/tests/tester.spec.ts',
    ]);
  });
});

describe('sveltekit-route with endpoint', () => {
  it('works', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner
      .runSchematicAsync(
        'sveltekit-route',
        { name: 'tester', endpoint: true },
        ftree
      )
      .toPromise();

    expect(tree.files).toEqual([
      '/src/routes/tester/index.svelte',
      '/src/routes/tester/index.ts',
      '/tests/tester.spec.ts',
    ]);
  });
});

describe('sveltekit-route skipTests', () => {
  it('works', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner
      .runSchematicAsync(
        'sveltekit-route',
        { name: 'tester', skipTests: true },
        ftree
      )
      .toPromise();

    expect(tree.files).toEqual([
      '/src/routes/tester/index.svelte',
      '/src/routes/tester/index.ts',
    ]);
  });
});

describe('sveltekit-route with path', () => {
  it('works', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    const tree = await runner
      .runSchematicAsync(
        'sveltekit-route',
        { name: 'a/b/c/tester', endpoint: true },
        ftree
      )
      .toPromise();

    expect(tree.files).toEqual([
      '/src/routes/a/b/c/tester/index.svelte',
      '/src/routes/a/b/c/tester/index.ts',
      '/tests/a/b/c/tester.spec.ts',
    ]);

    expect(tree.readContent('/tests/a/b/c/tester.spec.ts')).toContain(
      "await page.goto('/a/b/c/subject');"
    );
  });
});
