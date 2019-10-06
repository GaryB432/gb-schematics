import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

export function prettier(options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    // const sts = url('./files');
    // const templatedSource = apply(sts, [template({ ...options })]);
    const packageJsonPath = './package.json';
    const json = tree.read(packageJsonPath);
    if (json) {
      const pkgJson = {
        scripts: {
          format: 'prettier --write "**/src/**/{*.ts,*.scss,*.html,*.json}',
        },
        devDependencies: {
          prettier: '^1.15.2',
        },
      };
      const npk = JSON.parse(json.toString());
      const scripts = { ...npk.scripts, ...pkgJson.scripts };
      const devDependencies = { ...npk.devDependencies, ...pkgJson.devDependencies };
      npk.prettier = {
        bracketSpacing: true,
        printWidth: 100,
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'es5',
        useTabs: false,
      };
      npk.scripts = scripts;
      npk.devDependencies = devDependencies;
      tree.overwrite(packageJsonPath, JSON.stringify(npk, null, 2));
      if (!options.skipInstall) {
        _context.addTask(new NodePackageInstallTask());
      }
    }
    return tree;
    // return mergeWith(templatedSource, MergeStrategy.AllowOverwriteConflict);
  };
}
