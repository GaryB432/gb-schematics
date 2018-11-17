import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import { AngularApplicationOptionsSchema as ApplicationOptions } from '../application/schema';
import { AngularWorkspaceOptionsSchema as WorkspaceOptions } from '../workspace/schema';
import { AngularFormatOptionsSchema as AfOptions } from './schema';

describe('Angular Format Schematic', () => {
  const schematicRunner = new SchematicTestRunner(
    'schematics',
    require.resolve('../collection.json')
  );
  const defaultOptions: AfOptions = {};

  const workspaceOptions: WorkspaceOptions = {
    name: 'workspace',
    newProjectRoot: 'projects',
    version: '6.0.0',
  };

  const appOptions: ApplicationOptions = {
    name: 'bar',
    inlineStyle: false,
    inlineTemplate: false,
    routing: false,
    style: 'scss',
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
  it('should use the latest known versions in package.json', () => {
    const tree = schematicRunner.runSchematic(
      'angular-format',
      defaultOptions,
      appTree
    );
    const pkg = JSON.parse(tree.readContent('/package.json'));
    expect(pkg.devDependencies['prettier']).toEqual('^1.15.2');
    expect(pkg.scripts['format']).toEqual(
      'prettier --write "src/**/{*.ts,*.scss}'
    );
    expect(pkg.prettier).toEqual({
      printWidth: 100,
      singleQuote: true,
      useTabs: false,
      tabWidth: 2,
      semi: true,
      bracketSpacing: true,
      trailingComma: 'es5',
    });
  });
});
