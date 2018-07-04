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

  it('should create files', () => {
    // PS D:\Gary\schm-play> schematics gb-schematics:angular-iis-config --project schm-play
    const tree = schematicRunner.runSchematic(
      'angular-iis-config',
      { ...defaultOptions },
      appTree
    );
    const files = tree.files;
    expect(
      files.indexOf(`${projectPath}/iis-application/Properties/AssemblyInfo.cs`)
    ).toBeGreaterThanOrEqual(0);
    expect(
      files.indexOf(`${projectPath}/iis-application/Web.config`)
    ).toBeGreaterThanOrEqual(0);
    expect(
      files.indexOf(`${projectPath}/iis-application/Web.Debug.config`)
    ).toBeGreaterThanOrEqual(0);
    expect(
      files.indexOf(`${projectPath}/iis-application/Web.Release.config`)
    ).toBeGreaterThanOrEqual(0);
    expect(
      files.indexOf(`${projectPath}/iis-application/WebForm1.aspx`)
    ).toBeGreaterThanOrEqual(0);
    expect(
      files.indexOf(`${projectPath}/iis-application/WebForm1.aspx.cs`)
    ).toBeGreaterThanOrEqual(0);
    expect(
      files.indexOf(`${projectPath}/iis-application/WebForm1.aspx.designer.cs`)
    ).toBeGreaterThanOrEqual(0);
    expect(
      files.indexOf(`${projectPath}/iis-application/Bar.csproj`)
    ).toBeGreaterThanOrEqual(0);
    expect(
      files.indexOf(`${projectPath}/iis-application/Bar.sln`)
    ).toBeGreaterThanOrEqual(0);
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
