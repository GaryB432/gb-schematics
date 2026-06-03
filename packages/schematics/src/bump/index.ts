import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks/index.js';
import semver from 'semver';

import type { Options } from './schema.generated.js';

export const bumpParts = [
  'major',
  'premajor',
  'minor',
  'preminor',
  'patch',
  'prepatch',
  'prerelease',
] as const satisfies readonly NonNullable<Options['part']>[];

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
      if (!oldOne || !semver.valid(oldOne)) {
        throw new Error(
          `package.json version must be valid semver. Received ${JSON.stringify(oldOne)}.`,
        );
      }
      if (!options.part) {
        throw new Error('Missing required option: --part.');
      }

      const newOne = semver.inc(oldOne, options.part, options.tag ?? '');
      if (!newOne) {
        throw new Error(
          `Invalid bump part ${JSON.stringify(options.part)}. Expected one of ${bumpParts.join(', ')}.`,
        );
      }

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
