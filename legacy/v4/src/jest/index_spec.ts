// const collectionPath = path.join(__dirname, '../collection.json');

// describe('eslint', () => {
//   it('works', async () => {
//     const runner = new SchematicTestRunner('schematics', collectionPath);
//     const ftree = Tree.empty();
//     ftree.create(
//       'package.json',
//       JSON.stringify({ name: 'test', version: '1.2.3' })
//     );
//     const tree = await runner
//       .runSchematic('eslint', {}, ftree)
//       ;

//     expect(tree.files).toContain('/.eslintrc.js');
//   });
// });

import type { UnitTestTree } from '@angular-devkit/schematics/testing';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { readPackageJson } from '../package-config';
//  import { Schema as ApplicationOptions } from '../application/schema';
//  import { Schema as WorkspaceOptions } from '../workspace/schema';
//  import { Schema as AppShellOptions } from './schema';

describe('Jest Schematic', () => {
  const schematicRunner = new SchematicTestRunner(
    'gb-schematics',
    require.resolve('../collection.json')
  );
  //  const defaultOptions: AppShellOptions = {
  //    project: 'bar',
  //  };

  //  const workspaceOptions: WorkspaceOptions = {
  //    name: 'workspace',
  //    newProjectRoot: 'projects',
  //    version: '6.0.0',
  //  };

  //  const appOptions: ApplicationOptions = {
  //    name: 'bar',
  //    inlineStyle: false,
  //    inlineTemplate: false,
  //    routing: true,
  //    skipTests: false,
  //    skipPackageJson: false,
  //  };
  let appTree: UnitTestTree;

  beforeEach(async () => {
    appTree = await schematicRunner.runSchematic('typescript', {});

    appTree.create(
      '/package.json',
      JSON.stringify({ name: 'test', version: '1.2.3' })
    );
    //  appTree = await schematicRunner
    //    .runSchematic('application', appOptions, appTree)
    //    ;
  });

  // it('should ensure the client app has a router-outlet', async () => {
  //   appTree = await schematicRunner
  //     .runSchematic('workspace', workspaceOptions)
  //     ;
  //   appTree = await schematicRunner
  //     .runSchematic(
  //       'application',
  //       { ...appOptions, routing: false },
  //       appTree
  //     )
  //     ;
  //   await expectAsync(
  //     schematicRunner
  //       .runSchematic('appShell', defaultOptions, appTree)
  //
  //   ).toBeRejected();
  // });

  it('should add a universal app', async () => {
    const tree = await schematicRunner.runSchematic('jest', {}, appTree);
    // const filePath = '/projects/bar/src/app/app.server.module.ts';
    // expect(tree.exists(filePath)).toEqual(true);
    expect(tree.files).toEqual(
      jasmine.arrayWithExactContents([
        '/tsconfig.json',
        '/package.json',
        '/jest.config.js',
      ])
    );
  });

  it('should add packages', async () => {
    const tree = await schematicRunner.runSchematic('jest', {}, appTree);
    const filePath = '/package.json';
    const content = tree.readContent(filePath);
    const pkg = readPackageJson(tree);
    // expect(getPackageVersionFromPackageJson(tree, 'jest-junit')).toEqual(
    //   '^16.0.0'
    // );
    expect(pkg.devDependencies!['jest']).toEqual('^29.5.0');
    expect(pkg.devDependencies!['typescript']).toEqual('^5.0.0');
    // expect(content).toMatch(/import { RouterModule } from '@angular\/router';/);
  });

  //  it('should add app shell configuration', async () => {
  //    const tree = await schematicRunner
  //      .runSchematic('appShell', defaultOptions, appTree)
  //      ;
  //    const filePath = '/angular.json';
  //    const content = tree.readContent(filePath);
  //    const workspace = JSON.parse(content);
  //    const target = workspace.projects.bar.architect['app-shell'];
  //    expect(target.options.route).toEqual('shell');
  //    expect(target.configurations.development.browserTarget).toEqual('bar:build:development');
  //    expect(target.configurations.development.serverTarget).toEqual('bar:server:development');
  //    expect(target.configurations.production.browserTarget).toEqual('bar:build:production');
  //    expect(target.configurations.production.serverTarget).toEqual('bar:server:production');
  //  });

  //  it('should add router module to client app module', async () => {
  //    const tree = await schematicRunner
  //      .runSchematic('appShell', defaultOptions, appTree)
  //      ;
  //    const filePath = '/projects/bar/src/app/app.module.ts';
  //    const content = tree.readContent(filePath);
  //    expect(content).toMatch(/import { RouterModule } from '@angular\/router';/);
  //  });

  //  it('should not fail when AppModule have imported RouterModule already', async () => {
  //    const updateRecorder = appTree.beginUpdate('/projects/bar/src/app/app.module.ts');
  //    updateRecorder.insertLeft(0, "import { RouterModule } from '@angular/router';");
  //    appTree.commitUpdate(updateRecorder);

  //    const tree = await schematicRunner
  //      .runSchematic('appShell', defaultOptions, appTree)
  //      ;
  //    const filePath = '/projects/bar/src/app/app.module.ts';
  //    const content = tree.readContent(filePath);
  //    expect(content).toMatch(/import { RouterModule } from '@angular\/router';/);
  //  });
});
