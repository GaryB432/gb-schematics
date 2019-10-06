// import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';


// // You don't have to export the function as default. You can also have more than one rule factory
// // per file.
// export function eslint(_options: any): Rule {
//   return (tree: Tree, _context: SchematicContext) => {
//     return tree;
//   };
// }


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
  return (_host: Tree, _context: SchematicContext) => {
    // if (!options.project) {
    //   throw new SchematicsException(`Invalid options, "project" is required.`);
    // }
    // const project = getProject(tree, options.project);
    // if (!project) {
    //   throw new SchematicsException(`Project "${options.project}" not found.`);
    // }

    const sts = url('./files');

    const spts = apply(sts, [template({ ..._options })]);

    return mergeWith(spts);

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
