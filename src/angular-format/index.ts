import {
  Rule,
  SchematicContext,
  Tree,
  chain,
  noop,
} from '@angular-devkit/schematics';

import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import {
  NodeDependencyType,
  addPackageJsonDependency,
} from '../utility/dependencies';
import { AngularFormatOptionsSchema } from './schema';

function updateTsLintConfig(): Rule {
  return (host: Tree, _context: SchematicContext) => {
    const tsLintPath = '/tslint.json';
    const buffer = host.read(tsLintPath);
    if (!buffer) {
      return host;
    }
    const config = JSON.parse(buffer.toString());
    config.rulesDirectory.push('tslint-config-gb');
    host.overwrite('/tslint.json', JSON.stringify(config, null, 2));
    return host;
  };
}

function addDependenciesToPackageJson(options: AngularFormatOptionsSchema) {
  return (host: Tree, context: SchematicContext) => {
    [
      {
        type: NodeDependencyType.Dev,
        name: 'prettier',
        version: '^1.15.2',
      },
    ].forEach(dependency => addPackageJsonDependency(host, dependency));

    if (!options.skipInstall) {
      context.addTask(new NodePackageInstallTask());
    }

    return host;
  };
}

export default function(options: AngularFormatOptionsSchema): Rule {
  return (_host: Tree, _context: SchematicContext) => {
    return chain([
      updateTsLintConfig(),
      options.skipPackageJson ? noop() : addDependenciesToPackageJson(options),
    ]);
  };
}
