import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import { AngularApplicationOptionsSchema } from '../application/schema';
import { AngularWorkspaceOptionsSchema as WorkspaceOptions } from '../workspace/schema';
import { AngularIISConfigOptionsSchema as IisConfigOptions } from './schema';

describe('IIS Configuration Schematic', () => {
  const schematicRunner = new SchematicTestRunner(
    'schematics',
    require.resolve('../collection.json')
  );
  const defaultOptions: IisConfigOptions = {
    project: 'bar',
  };

  const workspaceOptions: WorkspaceOptions = {
    name: 'workspace',
    newProjectRoot: 'projects',
    version: '6.0.0',
  };

  const appOptions: AngularApplicationOptionsSchema = {
    name: 'bar',
    inlineStyle: false,
    inlineTemplate: false,
    routing: false,
    style: 'css',
    skipTests: false,
    skipPackageJson: false,
  };

  let appTree: UnitTestTree;
  beforeEach(() => {
    appTree = schematicRunner.runExternalSchematic(
      '@schematics/angular',
      'workspace',
      workspaceOptions
    );
    appTree = schematicRunner.runExternalSchematic(
      '@schematics/angular',
      'application',
      appOptions,
      appTree
    );
  });

  it('should create all files of an application', () => {
    const options = { ...defaultOptions };

    const tree = schematicRunner.runSchematic(
      'angular-iis-config',
      options,
      appTree
    );
    const files = tree.files;
    expect(files).toEqual(
      jasmine.arrayContaining([
        '/projects/bar/iis-application/Properties/AssemblyInfo.cs',
        '/projects/bar/iis-application/Web.config',
        '/projects/bar/iis-application/Web.Debug.config',
        '/projects/bar/iis-application/Web.Release.config',
        '/projects/bar/iis-application/WebForm1.aspx',
        '/projects/bar/iis-application/WebForm1.aspx.cs',
        '/projects/bar/iis-application/WebForm1.aspx.designer.cs',
        '/projects/bar/iis-application/Bar.csproj',
        '/projects/bar/iis-application/Bar.sln',
      ])
    );
  });

  it('AssemblyInfo should contain project name', () => {
    const tree = schematicRunner.runSchematic(
      'angular-iis-config',
      { ...defaultOptions },
      appTree
    );
    const content = tree.readContent(
      `/projects/bar/iis-application/Properties/AssemblyInfo.cs`
    );
    expect(content).toMatch(/\[assembly: AssemblyTitle\("Bar"\)\]/);
  });

  // it('should add the application to the workspace', () => {
  //   const options = { ...defaultOptions };

  //   const tree = schematicRunner.runSchematic(
  //     'angular-iis-config',
  //     options,
  //     appTree
  //   );
  //   const workspace = JSON.parse(tree.readContent('/angular.json'));
  //   expect(workspace.projects.foo).toBeDefined();
  //   expect(workspace.defaultProject).toBe('foo');
  // });
});
