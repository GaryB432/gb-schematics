import {
  apply,
  applyTemplates,
  branchAndMerge,
  chain,
  MergeStrategy,
  mergeWith,
  Rule,
  SchematicContext,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

export function jestFactory(options: any): Rule {
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

    const buff = tree.read('package.json');
    if (!buff) throw new Error('no package.json');

    const packageJson = JSON.parse(buff.toString());
    packageJson.devDependencies = packageJson.devDependencies || {};
    packageJson.scripts = packageJson.scripts || {};

    packageJson.devDependencies['prettier'] = '^2.4.1';
    packageJson.scripts['format'] = 'prettier --write .';

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

// import { strings } from '@angular-devkit/core';
// import {
//   apply,
//   applyTemplates,
//   branchAndMerge,
//   chain,
//   MergeStrategy,
//   mergeWith,
//   Rule,
//   SchematicContext,
//   Tree,
//   url,
// } from '@angular-devkit/schematics';

// export default function (): Rule {
//   const templatedSource = apply(url('./files'), [applyTemplates({ ...strings })]);

//   return (tree: Tree, context: SchematicContext) => {
//     const buff = tree.read('package.json');
//     if (!buff) throw new Error('no package.json');

//     const packageJson = JSON.parse(buff.toString());
//     packageJson.devDependencies = packageJson.devDependencies || {};
//     packageJson.scripts = packageJson.scripts || {};

//     packageJson.devDependencies['prettier'] = '^2.4.1';
//     packageJson.scripts['format'] = 'prettier --write .';

//     tree.overwrite('/package.json', JSON.stringify(packageJson, null, 2));

//     return chain([
//       branchAndMerge(
//         chain([mergeWith(templatedSource, MergeStrategy.Overwrite)]),
//         MergeStrategy.AllowOverwriteConflict
//       ),
//     ])(tree, context);
//   };
// }
