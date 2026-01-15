import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import semver from 'semver';

import type { Options } from './schema';

export function bump(options: Options): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const packageJsonPath = './package.json';
    const json = tree.read(packageJsonPath);
    if (json) {
      const pj = JSON.parse(json.toString()) as {
        name: string;
        version: string;
      };
      const oldOne = pj.version;
      const newOne =
        semver.inc(oldOne, options.part, options.tag ?? '') ?? pj.version;
      pj.version = newOne;
      tree.overwrite(packageJsonPath, `${JSON.stringify(pj, null, 2)}\n`);
      context.logger.info(`${oldOne} ➡️ ${newOne}`);
      if (!options.skipInstall) {
        context.addTask(new NodePackageInstallTask());
      }
    }
    return tree;
  };
}
