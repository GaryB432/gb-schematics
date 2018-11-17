import {
  Rule,
  SchematicContext,
  Tree,
  chain,
} from '@angular-devkit/schematics';

import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import {
  NodeDependencyType,
  addPackageJsonDependency,
} from '../utility/dependencies';
import { AngularFormatOptionsSchema } from './schema';

function addPrettierConfigToPackageJson(options: AngularFormatOptionsSchema) {
  return (host: Tree, context: SchematicContext) => {
    const pkg = host.read('/package.json');

    if (pkg) {
      const config = JSON.parse(pkg.toString());
      config.scripts['format'] = 'prettier --write "src/**/{*.ts,*.scss}';
      config.prettier = {
        printWidth: 100,
        singleQuote: true,
        useTabs: false,
        tabWidth: 2,
        semi: true,
        bracketSpacing: true,
        trailingComma: 'es5',
      };
      host.overwrite('/package.json', JSON.stringify(config, null, 2));
    }

    if (!options.skipInstall) {
      context.addTask(new NodePackageInstallTask());
    }

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
      addDependenciesToPackageJson(options),
      addPrettierConfigToPackageJson(options),
    ]);
  };
}
