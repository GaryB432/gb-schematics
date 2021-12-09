/* eslint-disable @typescript-eslint/no-var-requires */

import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
const semverInc = require('semver/functions/inc');

export interface SchematicOptions {
  part:
    | 'major'
    | 'premajor'
    | 'minor'
    | 'preminor'
    | 'patch'
    | 'prepatch'
    | 'prerelease';
  skipInstall: boolean;
}

export function bump(options: SchematicOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const packageJsonPath = './package.json';
    const json = tree.read(packageJsonPath);
    if (json) {
      const pj = JSON.parse(json.toString()) as {
        name: string;
        version: string;
      };
      pj.version = semverInc(pj.version, options.part);
      tree.overwrite(packageJsonPath, `${JSON.stringify(pj, null, 2)}\n`);
      if (!options.skipInstall) {
        context.addTask(new NodePackageInstallTask());
      }
    }
    return tree;
  };
}
