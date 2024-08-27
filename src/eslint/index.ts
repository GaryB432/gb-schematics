import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import {
  MergeStrategy,
  apply,
  applyTemplates,
  branchAndMerge,
  chain,
  mergeWith,
  noop,
  schematic,
  url,
} from '@angular-devkit/schematics';
import type { Options } from './schema';

export function eslint(options: Options): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const sts = url('./files');

    const templatedSource = apply(sts, [applyTemplates({ ...options })]);

    const packageJsonPath = './package.json';

    const json = tree.read(packageJsonPath);
    if (json) {
      const pkgJson = {
        scripts: {
          lint: `eslint .`,
        },
        devDependencies: {
          '@eslint/js': '^9.9.1',
          '@types/eslint__js': '^8.42.3',
          eslint: '^9.9.1',
          'eslint-plugin-gb': '^9.0.0',
          'typescript-eslint': '^8.3.0',
        },
        peerDependencies: {
          typescript: '^5.5.4',
        },
      };

      const npk = JSON.parse(json.toString());
      const scripts = { ...npk.scripts, ...pkgJson.scripts };
      const devDependencies = {
        ...npk.devDependencies,
        ...pkgJson.devDependencies,
      };
      const peerDependencies = {
        ...npk.peerDependencies,
        ...pkgJson.peerDependencies,
      };
      npk.scripts = scripts;
      npk.devDependencies = devDependencies;
      npk.peerDependencies = peerDependencies;
      tree.overwrite(packageJsonPath, JSON.stringify(npk, null, 2));
    }

    // const rule0: Rule = (tree: Tree) => {
    //   tree.create('test', 'test');
    //   tree.create('./src/dummy.ts', "console.log('dummy file');\n");
    //   // tree.delete('test');
    // };

    return chain([
      branchAndMerge(
        chain([
          tree.exists('./tsconfig.json') ? noop() : schematic('typescript', {}),
          schematic('prettier', {}),
          mergeWith(templatedSource, MergeStrategy.Overwrite),
          // mergeWith(rule0, MergeStrategy.Overwrite)
        ]),
        MergeStrategy.AllowOverwriteConflict
      ),
    ])(tree, context);
  };
}
