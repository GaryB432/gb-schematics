// import {
//   chain,
//   Rule,
//   Tree,
//   SchematicContext,
// } from '@angular-devkit/schematics';
// import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
// import { getStylesPath } from '../utils/ast';
// import { InsertChange } from '../utils/devkit-utils/change';
// import {
//   getProjectFromWorkspace,
//   getWorkspace,
// } from '../utils/devkit-utils/config';
// // import { addHeadLink } from '../utils/html';
// // import {
// //   angularVersion,
// //   cdkVersion,
// //   materialVersion,
// // } from '../utils/lib-versions';
// import { addPackageToPackageJson } from '../utils/package';
// import { Schema as FormatOptions } from './schema';
// // import { addThemeToAppStyles } from './theming';

// /**
//  * Scaffolds the basics of a Angular Material application, this includes:
//  *  - Add Packages to package.json
//  *  - Adds pre-built themes to styles.ext
//  *  - Adds Browser Animation to app.momdule
//  */
// export default function(options: FormatOptions): Rule {
//   return chain([
//     addMaterialToPackageJson(),
//     // addThemeToAppStyles(options),
//     // addBodyMarginToStyles(options),
//   ]);
// }

// /** Add material, cdk, annimations to package.json if not already present. */
// function addMaterialToPackageJson() {
//   return (host: Tree, context: SchematicContext) => {
//     addPackageToPackageJson(
//       host,
//       'dependencies',
//       '@angular/cdk',
//       'cdkVersion-wtf'
//     );
//     addPackageToPackageJson(
//       host,
//       'dependencies',
//       '@angular/material',
//       'materialVersion-wtf'
//     );
//     addPackageToPackageJson(
//       host,
//       'dependencies',
//       '@angular/animations',
//       'angularVersion-wtf'
//     );
//     context.addTask(new NodePackageInstallTask());
//     return host;
//   };
// }

// /** Add 0 margin to body in styles.ext */
// function addBodyMarginToStyles(options: FormatOptions) {
//   // return (host: Tree) => {
//   //   const workspace = getWorkspace(host);
//   //   const project = getProjectFromWorkspace(workspace, options.project);

//   //   const stylesPath = getStylesPath(project);

//   //   const buffer = host.read(stylesPath);
//   //   if (buffer) {
//   //     const src = buffer.toString();
//   //     const insertion = new InsertChange(
//   //       stylesPath,
//   //       src.length,
//   //       `\nbody { margin: 0; }\n`
//   //     );
//   //     const recorder = host.beginUpdate(stylesPath);
//   //     recorder.insertLeft(insertion.pos, insertion.toAdd);
//   //     host.commitUpdate(recorder);
//   //   } else {
//   //     console.warn(`Skipped body reset; could not find file: ${stylesPath}`);
//   //   }
//   // };
// }
