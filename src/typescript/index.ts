import {
  MergeStrategy,
  apply,
  applyTemplates,
  mergeWith,
  url,
  type Rule,
  type SchematicContext,
  type Tree,
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { type Options } from './schema';

export function typescript(options: Options): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const templateSource = apply(url('./files'), [applyTemplates(options)]);

    const packageJsonPath = './package.json';
    const json = tree.read(packageJsonPath);
    if (json) {
      const pkgJson = {
        scripts: {
          build: 'tsc',
        },
        devDependencies: {
          typescript: '^3.8.3',
        },
      };
      const npk = JSON.parse(json.toString());
      const scripts = { ...npk.scripts, ...pkgJson.scripts };
      const devDependencies = {
        ...npk.devDependencies,
        ...pkgJson.devDependencies,
      };
      npk.scripts = scripts;
      npk.devDependencies = devDependencies;
      tree.overwrite(packageJsonPath, JSON.stringify(npk, null, 2));
      if (!options.skipInstall) {
        context.addTask(new NodePackageInstallTask());
      }
    }
    return mergeWith(templateSource, MergeStrategy.AllowOverwriteConflict);
  };
}
