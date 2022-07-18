import {
  apply,
  applyTemplates,
  branchAndMerge,
  chain,
  MergeStrategy,
  mergeWith,
  noop,
  Rule,
  schematic,
  SchematicContext,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { Schema as Options } from './schema';

export function eslint(options: Options): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const sts = url('./files');

    const templatedSource = apply(sts, [applyTemplates({ ...options })]);

    const packageJsonPath = './package.json';

    const json = tree.read(packageJsonPath);
    if (json) {
      const pkgJson = {
        scripts: {
          lint: `eslint **/*.ts`,
        },
        devDependencies: {
          '@typescript-eslint/eslint-plugin': '^5.30.6',
          '@typescript-eslint/parser': '^5.30.6',
          eslint: '^8.20.0',
          'eslint-config-prettier': '^8.5.0',
          'eslint-plugin-gb': '^1.2.0',
          'eslint-plugin-prettier': '^4.2.1',
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
