import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import { getFileContent } from '@schematics/angular/utility/test';
import { createWorkspace, getTestProjectPath } from '../utils/testing';
import { join } from 'path';
import { WebAppOptions } from './options';

describe('angular-iis-config-schematic', () => {
  const collectionPath = join(__dirname, '../collection.json');
  const defaultOptions: WebAppOptions = {
    project: 'bar',
  };
  const schematicRunner = new SchematicTestRunner('schematics', collectionPath);
  const projectPath = getTestProjectPath();

  let appTree: UnitTestTree;

  beforeEach(() => {
    appTree = createWorkspace(schematicRunner, appTree);
  });

  it('should create Properties/AssemblyInfo.cs', () => {
    const tree = schematicRunner.runSchematic(
      'angular-iis-config',
      { ...defaultOptions },
      appTree
    );
    const files = tree.files;
    expect(files).toContain(
      `${projectPath}/iis-application/Properties/AssemblyInfo.cs`
    );
    expect(files).toContain(
      `${projectPath}/iis-application/Web.Release.config`
    );
  });

  it('AssemblyInfo should contain project name', () => {
    const tree = schematicRunner.runSchematic(
      'angular-iis-config',
      { ...defaultOptions },
      appTree
    );
    const content = getFileContent(
      tree,
      `${projectPath}/iis-application/Properties/AssemblyInfo.cs`
    );
    expect(content).toMatch(/\[assembly: AssemblyTitle\("Bar"\)\]/);
  });
});
