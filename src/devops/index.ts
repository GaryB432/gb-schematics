import {
  apply,
  applyTemplates,
  MergeStrategy,
  mergeWith,
  Rule,
  SchematicContext,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

interface PackageDef {
  scripts:{
    build?: string;
    test?: string;
    dependencies?: unknown;
    devDependencies?: unknown;
  }
} 

interface Options {
  platform: string;
  skipInstall: boolean;
}

export function devops(options: Options): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const urlString = `./files/${options.platform}`;
    const templateSource = apply(url(urlString), [applyTemplates(options)]);

    const packageJsonPath = './package.json';
    const json = tree.read(packageJsonPath);
    if (json) {
      // const pkgJson = {
      //   scripts: {
      //     build: 'tsc',
      //   },
      //   devDependencies: {
      //     typescript: '^3.8.3',
      //   },
      // };
      const npk = JSON.parse(json.toString()) as PackageDef;
      console.log(npk.scripts)
      // const scripts = { ...npk.scripts, ...pkgJson.scripts };
      // const devDependencies = {
      //   ...npk.devDependencies,
      //   ...pkgJson.devDependencies,
      // };
      // npk.scripts = scripts;
      // npk.devDependencies = devDependencies;
      // tree.overwrite(packageJsonPath, JSON.stringify(npk, null, 2));
      if (!options.skipInstall) {
        context.addTask(new NodePackageInstallTask());
      }
    }
    return mergeWith(templateSource, MergeStrategy.AllowOverwriteConflict);
  };
}
