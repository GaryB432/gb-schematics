/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {
  // MergeStrategy,
  Rule,
  SchematicContext,
  // SchematicsException,
  Tree,
  // apply,
  chain,
  // filter,
  // mergeWith,
  // move,
  noop,
  // schematic,
  // template,
  // url,
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
// interface ComponentOptions {
//   inlineStyle: boolean;
//   inlineTemplate: boolean;
//   skipTests: boolean;
//   spec: boolean;
//   styleext: string;
//   viewEncapsulation: string;
// }
// import { addProjectToWorkspace, getWorkspace } from '../utility/config';
import {
  NodeDependencyType,
  addPackageJsonDependency,
} from '../utility/dependencies';

import { AngularApplicationOptionsSchema as ApplicationOptions } from '../application/schema';
// import { latestVersions } from '../utility/latest-versions';
// import { validateProjectName } from '../utility/validation';
// import {
//   Builders,
//   ProjectType,
//   WorkspaceProject,
//   WorkspaceSchema,
// } from '../utility/workspace-models';
// interface ApplicationOptions {
//   inlineTemplate: boolean;
//   inlineStyle: boolean;
//   style: string;
//   skipTests: boolean;
//   prefix: string;
//   minimal: boolean;
//   viewEncapsulation: string;
//   routing: boolean;
//   skipPackageJson: boolean;
//   name: string;
//   projectRoot: string;
//   skipInstall: boolean;
// }

// TODO: use JsonAST
// function appendPropertyInAstObject(
//   recorder: UpdateRecorder,
//   node: JsonAstObject,
//   propertyName: string,
//   value: JsonValue,
//   indent = 4,
// ) {
//   const indentStr = '\n' + new Array(indent + 1).join(' ');

//   if (node.properties.length > 0) {
//     // Insert comma.
//     const last = node.properties[node.properties.length - 1];
//     recorder.insertRight(last.start.offset + last.text.replace(/\s+$/, '').length, ',');
//   }

//   recorder.insertLeft(
//     node.end.offset - 1,
//     '  '
//     + `"${propertyName}": ${JSON.stringify(value, null, 2).replace(/\n/g, indentStr)}`
//     + indentStr.slice(0, -2),
//   );
// }

function addDependenciesToPackageJson(options: ApplicationOptions) {
  // return (host: Tree, context: SchematicContext) => {
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
  return (host: Tree, context: SchematicContext) => {
    [
      {
        type: NodeDependencyType.Dev,
        name: 'prettier',
        version: '^1.15.2',
      },
      // {
      //   type: NodeDependencyType.Dev,
      //   name: '@angular-devkit/build-angular',
      //   version: latestVersions.DevkitBuildAngular,
      // },
      // {
      //   type: NodeDependencyType.Dev,
      //   name: 'typescript',
      //   version: latestVersions.TypeScript,
      // },
    ].forEach(dependency => addPackageJsonDependency(host, dependency));

    if (!options.skipInstall) {
      context.addTask(new NodePackageInstallTask());
    }

    return host;
  };
}

// function minimalPathFilter(path: string): boolean {
//   const toRemoveList = /(test.ts|tsconfig.spec.json|karma.conf.js)$/;

//   return !toRemoveList.test(path);
// }

export default function(options: ApplicationOptions): Rule {
  // return chain([
  //     addMaterialToPackageJson(),
  //     // addThemeToAppStyles(options),
  //     // addBodyMarginToStyles(options),
  //   ]);
  return (_host: Tree, _context: SchematicContext) => {
    if (!options.name) {
      console.log('that should be cool.');
      // throw new SchematicsException(`Invalid options, "name" is required.`);
    }
    // validateProjectName(options.name);
    // const prefix = options.prefix || 'app';
    // const appRootSelector = `${prefix}-root`;
    // const componentOptions: Partial<ComponentOptions> = !options.minimal
    //   ? {
    //       inlineStyle: options.inlineStyle,
    //       inlineTemplate: options.inlineTemplate,
    //       spec: !options.skipTests,
    //       styleext: options.style,
    //       viewEncapsulation: options.viewEncapsulation,
    //     }
    //   : {
    //       inlineStyle: true,
    //       inlineTemplate: true,
    //       spec: false,
    //       styleext: options.style,
    //     };

    // const workspace = getWorkspace(host);
    // let newProjectRoot = workspace.newProjectRoot;
    // let appDir = `${newProjectRoot}/${options.name}`;
    // let sourceRoot = `${appDir}/src`;
    // let sourceDir = `${sourceRoot}/app`;
    // let relativePathToWorkspaceRoot = appDir
    //   .split('/')
    //   .map(_ => '..')
    //   .join('/');
    // const rootInSrc = options.projectRoot !== undefined;
    // if (options.projectRoot !== undefined) {
    //   newProjectRoot = options.projectRoot;
    //   appDir = `${newProjectRoot}/src`;
    //   sourceRoot = appDir;
    //   sourceDir = `${sourceRoot}/app`;
    //   relativePathToWorkspaceRoot = relative(
    //     normalize('/' + sourceRoot),
    //     normalize('/')
    //   );
    //   if (relativePathToWorkspaceRoot === '') {
    //     relativePathToWorkspaceRoot = '.';
    //   }
    // }
    // const tsLintRoot = appDir;

    // const e2eOptions: E2eOptions = {
    //   name: `${options.name}-e2e`,
    //   relatedAppName: options.name,
    //   rootSelector: appRootSelector,
    //   projectRoot: newProjectRoot
    //     ? `${newProjectRoot}/${options.name}-e2e`
    //     : 'e2e',
    // };

    return chain([
      // addAppToWorkspaceFile(options, workspace),
      // mergeWith(
      //   apply(url('./files/src'), [
      //     options.minimal ? filter(minimalPathFilter) : noop(),
      //     template({
      //       utils: strings,
      //       ...options,
      //       dot: '.',
      //       relativePathToWorkspaceRoot,
      //     }),
      //     move(sourceRoot),
      //   ])
      // ),
      // mergeWith(
      //   apply(url('./files/root'), [
      //     options.minimal ? filter(minimalPathFilter) : noop(),
      //     template({
      //       utils: strings,
      //       ...options,
      //       dot: '.',
      //       relativePathToWorkspaceRoot,
      //       rootInSrc,
      //     }),
      //     move(appDir),
      //   ])
      // ),
      // options.minimal
      //   ? noop()
      //   : mergeWith(
      //       apply(url('./files/lint'), [
      //         template({
      //           utils: strings,
      //           ...options,
      //           tsLintRoot,
      //           relativePathToWorkspaceRoot,
      //           prefix,
      //         }),
      //         // TODO: Moving should work but is bugged right now.
      //         // The __tsLintRoot__ is being used meanwhile.
      //         // Otherwise the tslint.json file could be inside of the root folder and
      //         // this block and the lint folder could be removed.
      //       ])
      //     ),
      // schematic('module', {
      //   name: 'app',
      //   commonModule: false,
      //   flat: true,
      //   routing: options.routing,
      //   routingScope: 'Root',
      //   path: sourceDir,
      //   project: options.name,
      // }),
      // schematic('component', {
      //   name: 'app',
      //   selector: appRootSelector,
      //   flat: true,
      //   path: sourceDir,
      //   skipImport: true,
      //   project: options.name,
      //   ...componentOptions,
      // }),
      // mergeWith(
      //   apply(url('./other-files'), [
      //     componentOptions.inlineTemplate
      //       ? filter(path => !path.endsWith('.html'))
      //       : noop(),
      //     !componentOptions.spec
      //       ? filter(path => !path.endsWith('.spec.ts'))
      //       : noop(),
      //     template({
      //       utils: strings,
      //       ...(options as any), // tslint:disable-line:no-any
      //       selector: appRootSelector,
      //       ...componentOptions,
      //     }),
      //     move(sourceDir),
      //   ]),
      //   MergeStrategy.Overwrite
      // ),
      // options.minimal ? noop() : schematic('e2e', e2eOptions),
      options.skipPackageJson ? noop() : addDependenciesToPackageJson(options),
    ]);
  };
}
