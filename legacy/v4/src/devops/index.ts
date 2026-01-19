import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import {
  MergeStrategy,
  apply,
  applyTemplates,
  mergeWith,
  url,
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import type { Options } from './schema';

interface PackageDef {
  scripts: {
    build?: string;
    dependencies?: unknown;
    devDependencies?: unknown;
    test?: string;
  };
}

export function devops(options: Options): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const urlString = `./files/${options.platform}`;
    const templateSource = apply(url(urlString), [applyTemplates(options)]);

    const packageJsonPath = './package.json';
    const json = tree.read(packageJsonPath);
    if (json) {
      const npk = JSON.parse(json.toString()) as PackageDef;
      npk.scripts = { build: 'echo tbd' };
      tree.overwrite(packageJsonPath, JSON.stringify(npk, null, 2));
      if (!options.skipInstall) {
        context.addTask(new NodePackageInstallTask());
      }
    }
    return mergeWith(templateSource, MergeStrategy.AllowOverwriteConflict);
  };
}
