import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import { AngularWorkspaceOptionsSchema as WorkspaceOptions } from '../workspace/schema';

describe('Lint Rules Schematic', () => {
  const schematicRunner = new SchematicTestRunner(
    'schematics',
    require.resolve('../collection.json')
  );
  const defaultOptions = {};

  const workspaceOptions: WorkspaceOptions = {
    name: 'workspace',
    newProjectRoot: 'projects',
    version: '6.0.0',
  };

  let appTree: UnitTestTree;
  beforeEach(() => {
    appTree = schematicRunner.runExternalSchematic(
      '@schematics/angular',
      'workspace',
      workspaceOptions
    );
  });
  it('updates tslint configuration', () => {
    appTree = schematicRunner.runSchematic(
      'tslint-rules',
      defaultOptions,
      appTree
    );
    const config = JSON.parse(appTree.readContent('/tslint.json'));
    expect(config.rulesDirectory).toContain('node_modules/codelyzer');
    expect(config.rules['member-ordering']).toEqual([
      true,
      { order: 'instance-sandwich' },
    ]);
  });
});
