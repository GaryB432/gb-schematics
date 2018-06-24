import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../collection.json');

interface PwaOptions {
  configuration: string;
  project: string;
  target: string;
  title: string;
}
const defaultOptions: PwaOptions = {
  configuration: 'production',
  project: 'bar',
  target: 'build',
  title: 'Fake Title',
};

let appTree: UnitTestTree;

// const workspaceOptions = {
//   name: 'app',
//   version: '1.2.3',
//   skipInstall: false,
//   linkCli: false,
//   skipGit: false,
//   commit: null,

//   // directory: '',
//   // name: 'app',
//   // prefix: 'app',
//   // sourceDir: 'src',
//   // inlineStyle: false,
//   // inlineTemplate: false,
//   // viewEncapsulation: 'None',
//   // version: '1.2.3',
//   // routing: true,
//   // style: 'scss',
//   // skipTests: false,
//   // minimal: false,
// };

// const appOptions = {
//   name: 'ok',
//   version: 'fine',
// };

const workspaceOptions: any = {
  name: 'workspace',
  newProjectRoot: 'projects',
  version: '6.0.0',
};

const appOptions: any = {
  name: 'bar',
  inlineStyle: false,
  inlineTemplate: false,
  routing: false,
  style: 'css',
  skipTests: false,
};

describe('angular-iis-config', () => {
  const schematicRunner = new SchematicTestRunner('schematics', collectionPath);
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

  it('should create Properties/AssemblyInfo.cs', () => {
    const tree = schematicRunner.runSchematic(
      'angular-iis-config',
      defaultOptions,
      appTree
    );
    expect(tree.exists('iis-application/Properties/AssemblyInfo.cs')).toEqual(
      true
    );
  });

  it('AssemblyInfo should contain project name', () => {
    const tree = schematicRunner.runSchematic(
      'angular-iis-config',
      defaultOptions
    );
    const content = tree.readContent(
      'iis-application/Properties/AssemblyInfo.cs'
    );
    expect(content.indexOf('[assembly: AssemblyTitle("Bar")]')).toBeGreaterThan(
      -1
    );
    expect(
      content.indexOf('[assembly: AssemblyProduct("Bar")]')
    ).toBeGreaterThan(-1);
  });

  it('should create Web.config', () => {
    const tree = schematicRunner.runSchematic(
      'angular-iis-config',
      defaultOptions
    );
    expect(tree.exists('iis-application/Web.config')).toEqual(true);
  });

  it('should create Web.Debug.config', () => {
    const tree = schematicRunner.runSchematic(
      'angular-iis-config',
      defaultOptions
    );
    expect(tree.exists('iis-application/Web.Debug.config')).toEqual(true);
  });

  it('should create Web.Release.config', () => {
    const tree = schematicRunner.runSchematic(
      'angular-iis-config',
      defaultOptions
    );
    expect(tree.exists('iis-application/Web.Release.config')).toEqual(true);
  });

  it('should create WebApplication2.csproj', () => {
    const tree = schematicRunner.runSchematic(
      'angular-iis-config',
      defaultOptions
    );
    expect(tree.exists('iis-application/Bar.csproj')).toEqual(true);
  });

  it('should create WebApplication2.sln', () => {
    const tree = schematicRunner.runSchematic(
      'angular-iis-config',
      defaultOptions
    );
    expect(tree.exists('iis-application/Bar.sln')).toEqual(true);
  });

  it('should create WebForm1.aspx', () => {
    const tree = schematicRunner.runSchematic(
      'angular-iis-config',
      defaultOptions
    );
    expect(tree.exists('iis-application/WebForm1.aspx')).toEqual(true);
  });

  it('should create WebForm1.aspx.cs', () => {
    const tree = schematicRunner.runSchematic(
      'angular-iis-config',
      defaultOptions
    );
    expect(tree.exists('iis-application/WebForm1.aspx.cs')).toEqual(true);
  });

  it('WebForm.aspx should have page directive', () => {
    const tree = schematicRunner.runSchematic(
      'angular-iis-config',
      defaultOptions
    );
    const manifestText = tree.readContent('iis-application/WebForm1.aspx');
    expect(manifestText.substr(0, 102)).toEqual(
      'X%@ Page Language="C#" AutoEventWireup="true" CodeBehind="WebForm1.aspx.cs" Inherits="Bar.WebForm1" %>'
    );
  });

  it('should create WebForm1.aspx.designer.cs', () => {
    const tree = schematicRunner.runSchematic(
      'angular-iis-config',
      defaultOptions
    );
    expect(tree.exists('iis-application/WebForm1.aspx.designer.cs')).toEqual(
      true
    );
  });
});

// import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
// import * as path from 'path';

// const collectionPath = path.join(__dirname, '../collection.json');

// interface PwaOptions {
//   project: string;
//   target: string;
//   configuration: string;
//   title: string;
// }

// describe('IIS Schematic', () => {
//   const defaultOptions: PwaOptions = {
//     project: 'bar',
//     target: 'build',
//     configuration: 'production',
//     title: 'Fake Title',
//   };

//   let appTree: UnitTestTree;

//   const workspaceOptions: any = {
//     name: 'workspace',
//     newProjectRoot: 'projects',
//     version: '6.0.0',
//   };

//   const appOptions: any = {
//     name: 'bar',
//     inlineStyle: false,
//     inlineTemplate: false,
//     routing: false,
//     style: 'css',
//     skipTests: false,
//   };

// beforeEach(() => {
//   appTree = schematicRunner.runExternalSchematic('@schematics/angular', 'workspace', workspaceOptions);
//   appTree = schematicRunner.runExternalSchematic('@schematics/angular', 'application', appOptions, appTree);
// });

// it('should create Properties/AssemblyInfo.cs file', () => {
//   const tree = schematicRunner.runSchematic('ng-add', defaultOptions, appTree);
//   expect(tree.exists('/projects/bar/src/iis-app/Properties/AssemblyInfo.cs')).toEqual(true);
// });

//   it('should create Web.config file', () => {
//     const tree = schematicRunner.runSchematic('ng-add', defaultOptions, appTree);
//     expect(tree.exists('/projects/bar/src/iis-app/Web.config')).toEqual(true);
//   });

//   it('should create Web.Debug.config file', () => {
//     const tree = schematicRunner.runSchematic('ng-add', defaultOptions, appTree);
//     expect(tree.exists('/projects/bar/src/iis-app/Web.Debug.config')).toEqual(true);
//   });

//   it('should create Web.Release.config file', () => {
//     const tree = schematicRunner.runSchematic('ng-add', defaultOptions, appTree);
//     expect(tree.exists('/projects/bar/src/iis-app/Web.Release.config')).toEqual(true);
//   });

//   it('should create csproj file', () => {
//     const tree = schematicRunner.runSchematic('ng-add', defaultOptions, appTree);
//     expect(tree.exists('/projects/bar/src/iis-app/Bar.csproj')).toEqual(true);
//   });

//   it('should create WebApplication2.sln file', () => {
//     const tree = schematicRunner.runSchematic('ng-add', defaultOptions, appTree);
//     expect(tree.exists('/projects/bar/src/iis-app/WebApplication2.sln')).toEqual(true);
//   });

//   it('should create WebForm1.aspx file', () => {
//     const tree = schematicRunner.runSchematic('ng-add', defaultOptions, appTree);
//     expect(tree.exists('/projects/bar/src/iis-app/WebForm1.aspx')).toEqual(true);
//   });

//   it('should create WebForm1.aspx.cs file', () => {
//     const tree = schematicRunner.runSchematic('ng-add', defaultOptions, appTree);
//     expect(tree.exists('/projects/bar/src/iis-app/WebForm1.aspx.cs')).toEqual(true);
//   });

//   it('should create WebForm1.aspx.designer.cs file', () => {
//     const tree = schematicRunner.runSchematic('ng-add', defaultOptions, appTree);
//     expect(tree.exists('/projects/bar/src/iis-app/WebForm1.aspx.designer.cs')).toEqual(true);
//   });

// });
