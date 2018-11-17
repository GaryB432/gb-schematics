// /**
//  * @license
//  * Copyright Google Inc. All Rights Reserved.
//  *
//  * Use of this source code is governed by an MIT-style license that can be
//  * found in the LICENSE file at https://angular.io/license
//  */
// import {
//   SchematicTestRunner,
//   UnitTestTree,
// } from '@angular-devkit/schematics/testing';
// import { AngularApplicationOptionsSchema as ApplicationOptions } from '../application/schema';
// import { AngularWorkspaceOptionsSchema as WorkspaceOptions } from '../workspace/schema';
// import { AngularIISConfigOptionsSchema as IisConfigOptions } from './schema';

// import { getProject } from '../utility/project';
// import { getFileContent } from '../utility/test';

// // const projectPath = getTestProjectPath();

// describe('Class Schematic', () => {
//   const schematicRunner = new SchematicTestRunner(
//     'schematics',
//     require.resolve('../collection.json')
//   );
//   const defaultOptions: IisConfigOptions = {
//     name: 'foo',
//     type: '',
//     spec: false,
//     project: 'bar',
//   };

//   const workspaceOptions: WorkspaceOptions = {
//     name: 'workspace',
//     newProjectRoot: 'projects',
//     version: '6.0.0',
//   };

//   const appOptions: ApplicationOptions = {
//     name: 'bar',
//     inlineStyle: false,
//     inlineTemplate: false,
//     routing: false,
//     style: 'css',
//     skipTests: false,
//     skipPackageJson: false,
//   };
//   let projectPath: string;
//   let appTree: UnitTestTree;
//   beforeEach(() => {
//     // appTree = schematicRunner.runSchematic('workspace', workspaceOptions);
//     appTree = schematicRunner.runExternalSchematic(
//       '@schematics/angular',
//       'workspace',
//       workspaceOptions
//     );
//     // appTree = schematicRunner.runSchematic('application', appOptions, appTree);
//     appTree = schematicRunner.runExternalSchematic(
//       '@schematics/angular',
//       'application',
//       appOptions,
//       appTree
//     );
//     projectPath = getProject(appTree, 'bar').root;
//   });

//   xit('should create files', () => {
//     // PS D:\Gary\schm-play> schematics gb-schematics:angular-iis-config --project schm-play
//     const tree = schematicRunner.runSchematic(
//       'angular-iis-config',
//       { ...defaultOptions },
//       appTree
//     );
//     const files = tree.files;
//     expect(
//       files.indexOf(`${projectPath}/iis-application/Properties/AssemblyInfo.cs`)
//     ).toBeGreaterThanOrEqual(0);
//     expect(
//       files.indexOf(`${projectPath}/iis-application/Web.config`)
//     ).toBeGreaterThanOrEqual(0);
//     expect(
//       files.indexOf(`${projectPath}/iis-application/Web.Debug.config`)
//     ).toBeGreaterThanOrEqual(0);
//     expect(
//       files.indexOf(`${projectPath}/iis-application/Web.Release.config`)
//     ).toBeGreaterThanOrEqual(0);
//     expect(
//       files.indexOf(`${projectPath}/iis-application/WebForm1.aspx`)
//     ).toBeGreaterThanOrEqual(0);
//     expect(
//       files.indexOf(`${projectPath}/iis-application/WebForm1.aspx.cs`)
//     ).toBeGreaterThanOrEqual(0);
//     expect(
//       files.indexOf(`${projectPath}/iis-application/WebForm1.aspx.designer.cs`)
//     ).toBeGreaterThanOrEqual(0);
//     expect(
//       files.indexOf(`${projectPath}/iis-application/Bar.csproj`)
//     ).toBeGreaterThanOrEqual(0);
//     expect(
//       files.indexOf(`${projectPath}/iis-application/Bar.sln`)
//     ).toBeGreaterThanOrEqual(0);
//   });

//   it('AssemblyInfo should contain project name', () => {
//     expect(appTree).toBeUndefined();
//     const tree = schematicRunner.runSchematic(
//       'angular-iis-config',
//       { ...defaultOptions },
//       appTree
//     );
//     const content = getFileContent(
//       tree,
//       `${projectPath}/iis-application/Properties/AssemblyInfo.cs`
//     );
//     expect(content).toMatch(/\[assembly: AssemblyTitle\("Bar"\)\]/);
//   });
// });

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// tslint:disable:no-big-function
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import { latestVersions } from '../utility/latest-versions';
import { AngularWorkspaceOptionsSchema as WorkspaceOptions } from '../workspace/schema';
//import { AngularApplicationOptionsSchema as ApplicationOptions } from '../application/schema';
import { AngularIISConfigOptionsSchema as IisConfigOptions } from './schema';

// tslint:disable:max-line-length
describe('IIS Configuration Schematic', () => {
  // const schematicRunner = new SchematicTestRunner(
  //   '@schematics/angular',
  //   require.resolve('../collection.json')
  // );

  // const workspaceOptions: WorkspaceOptions = {
  //   name: 'workspace',
  //   newProjectRoot: 'projects',
  //   version: '6.0.0',
  // };

  // const defaultOptions: ApplicationOptions = {
  //   name: 'foo',
  //   inlineStyle: false,
  //   inlineTemplate: false,
  //   routing: false,
  //   style: 'css',
  //   skipTests: false,
  //   skipPackageJson: false,
  // };

  // let workspaceTree: UnitTestTree;
  //===========
  // describe('Class Schematic', () => {
  const schematicRunner = new SchematicTestRunner(
    'schematics',
    require.resolve('../collection.json')
  );
  const defaultOptions: IisConfigOptions = {
    name: 'foo',
    type: '',
    spec: false,
    project: 'bar',
  };

  const workspaceOptions: WorkspaceOptions = {
    name: 'workspace',
    newProjectRoot: 'projects',
    version: '6.0.0',
  };

  const appOptions: IisConfigOptions = {
    name: 'bar',
    inlineStyle: false,
    inlineTemplate: false,
    routing: false,
    style: 'css',
    skipTests: false,
    skipPackageJson: false,
  };
  // let projectPath: string;
  let appTree: UnitTestTree;
  beforeEach(() => {
    // appTree = schematicRunner.runSchematic('workspace', workspaceOptions);
    appTree = schematicRunner.runExternalSchematic(
      '@schematics/angular',
      'workspace',
      workspaceOptions
    );
    // appTree = schematicRunner.runSchematic('application', appOptions, appTree);
    appTree = schematicRunner.runExternalSchematic(
      '@schematics/angular',
      'application',
      appOptions,
      appTree
    );
    // projectPath = getProject(appTree, 'bar').root;
  });

  // beforeEach(() => {
  //   workspaceTree = schematicRunner.runSchematic('workspace', workspaceOptions);
  // });

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

  xit('should add the application to the workspace', () => {
    const options = { ...defaultOptions };

    const tree = schematicRunner.runSchematic(
      'angular-iis-config',
      options,
      appTree
    );
    const workspace = JSON.parse(tree.readContent('/angular.json'));
    expect(workspace.projects.foo).toBeDefined();
    expect(workspace.defaultProject).toBe('foo');
  });

  describe(`update package.json`, () => {
    xit(`should add build-angular to devDependencies`, () => {
      const tree = schematicRunner.runSchematic(
        'angular-iis-config',
        defaultOptions,
        appTree
      );

      const packageJson = JSON.parse(tree.readContent('package.json'));
      expect(
        packageJson.devDependencies['@angular-devkit/build-angular']
      ).toEqual(latestVersions.DevkitBuildAngular);
    });

    xit('should use the latest known versions in package.json', () => {
      const tree = schematicRunner.runSchematic(
        'angular-iis-config',
        defaultOptions,
        appTree
      );
      const pkg = JSON.parse(tree.readContent('/package.json'));
      expect(pkg.devDependencies['@angular/compiler-cli']).toEqual(
        latestVersions.Angular
      );
      expect(pkg.devDependencies['typescript']).toEqual(
        latestVersions.TypeScript
      );
    });
  });
});
