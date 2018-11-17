// import {
//   SchematicTestRunner,
//   UnitTestTree,
// } from '@angular-devkit/schematics/testing';
// import { getFileContent } from '@schematics/angular/utility/test';
// import { createWorkspace, getTestProjectPath } from '../utils/testing';
// import { join } from 'path';
// import { WebAppOptions } from './options';

// describe('angular-iis-config-schematic', () => {
//   const collectionPath = join(__dirname, '../collection.json');
//   const defaultOptions: WebAppOptions = {
//     project: 'bar',
//   };
//   const schematicRunner = new SchematicTestRunner('schematics', collectionPath);
//   const projectPath = getTestProjectPath();

//   let appTree: UnitTestTree;

//   beforeEach(() => {
//     appTree = createWorkspace(schematicRunner, appTree);
//   });

//   it('should create files', () => {
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
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { Schema as PwaOptions } from './schema';

// tslint:disable:max-line-length
describe('PWA Schematic', () => {
  const schematicRunner = new SchematicTestRunner(
    '@angular/pwa',
    path.join(__dirname, '../collection.json')
  );
  const defaultOptions: PwaOptions = {
    project: 'bar',
    target: 'build',
    configuration: 'production',
    title: 'Fake Title',
  };

  let appTree: UnitTestTree;

  // tslint:disable-next-line:no-any
  const workspaceOptions: any = {
    name: 'workspace',
    newProjectRoot: 'projects',
    version: '6.0.0',
  };

  // tslint:disable-next-line:no-any
  const appOptions: any = {
    name: 'bar',
    inlineStyle: false,
    inlineTemplate: false,
    routing: false,
    style: 'css',
    skipTests: false,
  };

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

  it('should run the service worker schematic', done => {
    schematicRunner
      .runSchematicAsync('ng-add', defaultOptions, appTree)
      .toPromise()
      .then(tree => {
        const configText = tree.readContent('/angular.json');
        const config = JSON.parse(configText);
        const swFlag =
          config.projects.bar.architect.build.configurations.production
            .serviceWorker;
        expect(swFlag).toEqual(true);
        done();
      }, done.fail);
  });

  it('should create icon files', done => {
    const dimensions = [72, 96, 128, 144, 152, 192, 384, 512];
    const iconPath = '/projects/bar/src/assets/icons/icon-';
    schematicRunner
      .runSchematicAsync('ng-add', defaultOptions, appTree)
      .toPromise()
      .then(tree => {
        dimensions.forEach(d => {
          const path = `${iconPath}${d}x${d}.png`;
          expect(tree.exists(path)).toEqual(true);
        });
        done();
      }, done.fail);
  });

  it('should create a manifest file', done => {
    schematicRunner
      .runSchematicAsync('ng-add', defaultOptions, appTree)
      .toPromise()
      .then(tree => {
        expect(tree.exists('/projects/bar/src/manifest.json')).toEqual(true);
        done();
      }, done.fail);
  });

  it('should set the name & short_name in the manifest file', done => {
    schematicRunner
      .runSchematicAsync('ng-add', defaultOptions, appTree)
      .toPromise()
      .then(tree => {
        const manifestText = tree.readContent(
          '/projects/bar/src/manifest.json'
        );
        const manifest = JSON.parse(manifestText);

        expect(manifest.name).toEqual(defaultOptions.title);
        expect(manifest.short_name).toEqual(defaultOptions.title);
        done();
      }, done.fail);
  });

  it('should set the name & short_name in the manifest file when no title provided', done => {
    const options = { ...defaultOptions, title: undefined };
    schematicRunner
      .runSchematicAsync('ng-add', options, appTree)
      .toPromise()
      .then(tree => {
        const manifestText = tree.readContent(
          '/projects/bar/src/manifest.json'
        );
        const manifest = JSON.parse(manifestText);

        expect(manifest.name).toEqual(defaultOptions.project);
        expect(manifest.short_name).toEqual(defaultOptions.project);
        done();
      }, done.fail);
  });

  it('should update the index file', done => {
    schematicRunner
      .runSchematicAsync('ng-add', defaultOptions, appTree)
      .toPromise()
      .then(tree => {
        const content = tree.readContent('projects/bar/src/index.html');

        expect(content).toMatch(/<link rel="manifest" href="manifest.json">/);
        expect(content).toMatch(/<meta name="theme-color" content="#1976d2">/);
        expect(content).toMatch(
          /<noscript>Please enable JavaScript to continue using this application.<\/noscript>/
        );
        done();
      }, done.fail);
  });

  it('should not add noscript element to the index file if already present', done => {
    let index = appTree.readContent('projects/bar/src/index.html');
    index = index.replace(
      '</body>',
      '<noscript>NO JAVASCRIPT</noscript></body>'
    );
    appTree.overwrite('projects/bar/src/index.html', index);
    schematicRunner
      .runSchematicAsync('ng-add', defaultOptions, appTree)
      .toPromise()
      .then(tree => {
        const content = tree.readContent('projects/bar/src/index.html');

        expect(content).toMatch(/<link rel="manifest" href="manifest.json">/);
        expect(content).toMatch(/<meta name="theme-color" content="#1976d2">/);
        expect(content).not.toMatch(
          /<noscript>Please enable JavaScript to continue using this application.<\/noscript>/
        );
        expect(content).toMatch(/<noscript>NO JAVASCRIPT<\/noscript>/);
        done();
      }, done.fail);
  });

  it('should update the build and test assets configuration', done => {
    schematicRunner
      .runSchematicAsync('ng-add', defaultOptions, appTree)
      .toPromise()
      .then(tree => {
        const configText = tree.readContent('/angular.json');
        const config = JSON.parse(configText);
        const targets = config.projects.bar.architect;

        ['build', 'test'].forEach(target => {
          expect(targets[target].options.assets).toContain(
            'projects/bar/src/manifest.json'
          );
        });
        done();
      }, done.fail);
  });
});
