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

    // const packageJsonPath = './package.json';
    // const json = tree.read(packageJsonPath);
    // if (json) {
    //   const pkgJson = {
    //     scripts: {
    //       format: 'prettier --write "**/src/**/{*.ts,*.scss,*.html,*.json}',
    //     },
    //     devDependencies: {
    //       prettier: '^2.0.5',
    //     },
    //   };
    //   const npk = JSON.parse(json.toString());
    //   const scripts = { ...npk.scripts, ...pkgJson.scripts };
    //   const devDependencies = { ...npk.devDependencies, ...pkgJson.devDependencies };
    //   npk.prettier = {
    //     bracketSpacing: true,
    //     printWidth: 100,
    //     semi: true,
    //     singleQuote: true,
    //     tabWidth: 2,
    //     trailingComma: 'es5',
    //     useTabs: false,
    //   };
    //   npk.scripts = scripts;
    //   npk.devDependencies = devDependencies;
    //   tree.overwrite(packageJsonPath, JSON.stringify(npk, null, 2));
    //   if (!options.skipInstall) {
    //     _context.addTask(new NodePackageInstallTask());
    //   }
    // }
    // return tree;
    // return mergeWith(templatedSource, MergeStrategy.AllowOverwriteConflict);

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
