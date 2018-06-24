import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import { join } from 'path';
import { getFileContent } from '@schematics/angular/utility/test';

const collectionPath = join(__dirname, '../collection.json');

describe('angular-format-schematic', () => {
  let runner: SchematicTestRunner;
  let appTree: UnitTestTree;
  const options = {
    unchecked: 'bull',
    whatever: true,
    // name: 'foo',
    // path: 'app',
    // sourceDir: 'src',
    // inlineStyle: false,
    // inlineTemplate: false,
    // changeDetection: 'Default',
    // styleext: 'css',
    // spec: true,
    // module: undefined,
    // export: false,
    // prefix: undefined,
    // viewEncapsulation: undefined,
  };

  runner = new SchematicTestRunner('schematics', collectionPath);
  beforeEach(() => {
    appTree = runner.runExternalSchematic('@schematics/angular', 'workspace', {
      name: 'workspace',
      newProjectRoot: 'projects',
      version: '6.0.0',
    });
    appTree = runner.runExternalSchematic(
      '@schematics/angular',
      'application',
      {
        name: 'bar',
        inlineStyle: false,
        inlineTemplate: false,
        routing: false,
        style: 'scss',
        skipTests: false,
      },
      appTree
    );
  });

  it('should not blow up', () => {
    const tree = runner.runSchematic('angular-format', options, appTree);
    const files = tree.files;

    expect(files).toContain('/projects/bar/tsconfig.app.json');
    expect(files).toContain('/tslint.json');

    const moduleContent = getFileContent(
      tree,
      '/projects/bar/src/app/app.module.ts'
    );
    expect(moduleContent).toMatch(/import.*App.*from '.\/app.component'/);
  });
  it('should test stuff', () => {
    const tree = runner.runSchematic('angular-format', options, appTree);
    const files = tree.files;
    expect(files).toContain('/projects/bar/tsconfig.app.json');
    expect(files).toContain('/tslint.json');
  });
});
