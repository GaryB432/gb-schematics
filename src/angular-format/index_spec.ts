import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import { join } from 'path';
import { createWorkspace, getTestProjectPath } from '../utils/testing';
import { Schema as FormatOptions } from './schema';
import { getFileContent } from '@schematics/angular/utility/test';

describe('angular-format-schematic', () => {
  const collectionPath = join(__dirname, '../collection.json');
  const defaultOptions: FormatOptions = {
    project: 'bar',
  };
  const schematicRunner = new SchematicTestRunner('schematics', collectionPath);
  const projectPath = getTestProjectPath();

  let appTree: UnitTestTree;

  beforeEach(() => {
    appTree = createWorkspace(schematicRunner, appTree);
  });

  it('should create a component', () => {
    const tree = schematicRunner.runSchematic(
      'angular-format',
      { ...defaultOptions },
      appTree
    );

    const files = tree.files;

    expect(files).toContain('/projects/bar/tsconfig.app.json');
    expect(files).toContain('/tslint.json');

    const moduleContent = getFileContent(
      tree,
      `${projectPath}/src/app/app.module.ts`
    );
    expect(moduleContent).toMatch(/import.*App.*from '.\/app.component'/);
  });
  it('should test stuff', () => {
    const tree = schematicRunner.runSchematic(
      'angular-format',
      { ...defaultOptions },
      appTree
    );
    const files = tree.files;
    expect(files).toContain('/projects/bar/tsconfig.app.json');
    expect(files).toContain('/tslint.json');
  });
});
