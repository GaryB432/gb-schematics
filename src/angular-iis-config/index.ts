// import { classify, dasherize } from '@angular-devkit/core/src/utils/strings';
// import {
//   apply,
//   branchAndMerge,
//   chain,
//   MergeStrategy,
//   mergeWith,
//   move,
//   Rule,
//   SchematicContext,
//   template,
//   Tree,
//   url,
// } from '@angular-devkit/schematics';

// import {
//   getProjectFromWorkspace,
//   getWorkspace,
// } from '../utils/devkit-utils/config';

// interface WebAppOptions {
//   project: string;
// }

// const stringUtils = { dasherize, classify };

// export function angularIisConfig(options: WebAppOptions): Rule {
//   return (tree: Tree, context: SchematicContext) => {
//     const project = getProjectFromWorkspace(
//       getWorkspace(tree),
//       options.project
//     );
//     const iisAppPath = `${project.root}./iis-application`;

//     const templateSource = apply(url('./files'), [
//       template({
//         ...stringUtils,
//         ...options,
//       }),
//       move(iisAppPath),
//     ]);

//     return chain([
//       branchAndMerge(
//         chain([mergeWith(templateSource, MergeStrategy.Overwrite)]),
//         MergeStrategy.AllowOverwriteConflict
//       ),
//     ])(tree, context);
//   };
// }
