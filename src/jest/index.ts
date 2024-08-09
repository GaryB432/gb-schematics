import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import {
  MergeStrategy,
  apply,
  applyTemplates,
  branchAndMerge,
  chain,
  mergeWith,
  url,
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { readPackageJson } from '../package-config';

interface Options {
  skipInstall: boolean;
}

export function jestFactory(options: Options): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const templatedSource = apply(url('./files'), [
      applyTemplates({ ...options }),
    ]);

    const packageJson = readPackageJson(tree);
    packageJson.devDependencies = packageJson.devDependencies || {};
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      '@types/jest': '^29.5.0',
      jest: '^29.5.0',
      'jest-environment-jsdom': '^29.5.0',
      'jest-junit': '^16.0.0',
      prettier: '^2.4.1',
      'ts-jest': '^29.0.0',
      typescript: '^5.0.0',
    };
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts['test'] = 'npx jest';

    tree.overwrite('/package.json', JSON.stringify(packageJson, null, 2));
    if (!options.skipInstall) {
      context.addTask(new NodePackageInstallTask());
    }

    return chain([
      branchAndMerge(
        chain([mergeWith(templatedSource, MergeStrategy.Overwrite)]),
        MergeStrategy.AllowOverwriteConflict
      ),
    ])(tree, context);
  };
}
