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
    if (options.includePrettier) {
      context.logger.error(`--prettier option is no longer supported.`);
      options.includePrettier = false;
    }
    const sts = url('./files');

    const templatedSource = apply(sts, [applyTemplates({ ...options })]);

    const packageJsonPath = './package.json';

    const json = tree.read(packageJsonPath);
    if (!json) throw new Error('no package json');
    const newThings = {
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
    const scripts = { ...npk.scripts, ...newThings.scripts };
    const devDependencies = {
      ...npk.devDependencies,
      ...newThings.devDependencies,
    };
    const peerDependencies = {
      ...npk.peerDependencies,
      ...newThings.peerDependencies,
    };
    npk.scripts = scripts;
    npk.devDependencies = devDependencies;
    npk.peerDependencies = peerDependencies;
    tree.overwrite(packageJsonPath, JSON.stringify(npk, null, 2));

    // const rule0: Rule = (tree: Tree) => {
    //   tree.create('test', 'test');
    //   tree.create('./src/dummy.ts', "console.log('dummy file');\n");
    //   // tree.delete('test');
    // };

    return chain([
      branchAndMerge(
        chain([
          tree.exists('./tsconfig.json') ? noop() : schematic('typescript', {}),
          options.includePrettier ? schematic('prettier', {}) : noop(),
          mergeWith(templatedSource, MergeStrategy.Overwrite),
          // mergeWith(rule0, MergeStrategy.Overwrite)
        ]),
        MergeStrategy.AllowOverwriteConflict
      ),
    ])(tree, context);
  };
}
