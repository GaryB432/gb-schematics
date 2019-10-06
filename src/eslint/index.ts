import { parse, sep, normalize } from 'path';
import {
  chain,
  Rule,
  SchematicContext,
  Tree,
  apply,
  url,
  template,
  move,
  branchAndMerge,
  mergeWith,
  MergeStrategy,
} from '@angular-devkit/schematics';




// function updateTsLintConfig(): Rule {
//   return (host: Tree, _context: SchematicContext) => {
//     const tsLintPath = '/tslint.json';
//     const buffer = host.read(tsLintPath);
//     if (!buffer) {
//       return host;
//     }
//     const config = JSON.parse(buffer.toString()) as Tsl;
//     config.rules['interface-name'] = [true, 'always-prefix'];
//     config.rules['member-access'] = true;
//     config.rules['member-ordering'] = [true, { order: 'instance-sandwich' }];
//     config.rules['object-literal-sort-keys'] = true;
//     config.rules['variable-name'] = [
//       true,
//       'ban-keywords',
//       'check-format',
//       'allow-leading-underscore',
//     ];

//     host.overwrite('/tslint.json', JSON.stringify(config, null, 2));
//     return host;
//   };
// }

export function eslint(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    // if (!options.project) {
    //   throw new SchematicsException(`Invalid options, "project" is required.`);
    // }
    // const project = getProject(tree, options.project);
    // if (!project) {
    //   throw new SchematicsException(`Project "${options.project}" not found.`);
    // }

    const sts = url('./files');

    const templatedSource = apply(sts, [template({ ..._options })]);


    const packageJsonPath = './package.json';

    const json = tree.read(packageJsonPath);
    if (json) {
      const tsFolders: Map<string, boolean> = new Map();
      tree.visit(f => {
        if (!f.startsWith('/node_modules/')) {
          if (f.endsWith('.ts')) {
            tsFolders.set(parse(f).dir.split('/').slice(0, 3).join('/'), true);
            console.log(f);
          }
        }
      });

      const pkgJson = {
        scripts: {
          lint:
            `eslint \"{${Array.from(tsFolders.keys()).join(',')}}/**/*.ts\" -f eslint-formatter-friendly`
        },
        devDependencies: {
          "@typescript-eslint/eslint-plugin": "^2.0.0",
          "@typescript-eslint/parser": "^2.0.0",
          eslint: "^6.3.0",
          "eslint-config-prettier": "^6.1.0",
          "eslint-formatter-friendly": "^7.0.0",
          "eslint-plugin-prettier": "^3.1.0"
        }
      };

      const npk = JSON.parse(json.toString());
      const scripts = { ...npk.scripts, ...pkgJson.scripts };
      const devDependencies = { ...npk.devDependencies, ...pkgJson.devDependencies };
      npk.scripts = scripts;
      npk.devDependencies = devDependencies;
      tree.overwrite(packageJsonPath, JSON.stringify(npk, null, 2));
    }

    return mergeWith(templatedSource, MergeStrategy.AllowOverwriteConflict);

    // const iisAppPath = `$./iis-application`;

    // const templateSource = apply(url('./files'), [
    //   template({
    //     ...stringUtils,
    //     ...options,
    //   }),
    //   move(iisAppPath),
    // ]);

    // return (tree: Tree, _context: SchematicContext) => {
    //   return tree;
    // };


    // return chain([
    //   branchAndMerge(
    //     chain([mergeWith(templateSource, MergeStrategy.Overwrite)]),
    //     MergeStrategy.AllowOverwriteConflict
    //   ),
    // ])(tree, context);
    // return chain([updateTsLintConfig()]);
  };
}
