// import { strings } from '@angular-devkit/core';
// import {
//   apply,
//   applyTemplates,
//   branchAndMerge,
//   chain,
//   FileEntry,
//   MergeStrategy,
//   mergeWith,
//   noop,
//   Rule,
//   SchematicContext,
//   Tree,
//   url,
// } from '@angular-devkit/schematics';
// import minimatch = require('minimatch');
// import {
//   getFromJsonFile,
//   getModuleInfo,
//   getPackageInfo,
//   ILernaJson,
//   IPackageJson,
// } from '../utils';

export interface ModuleOptions {
  kind?: 'class' | 'values';
  name: string;
  packageName?: string;
  test?: boolean;
}

export interface ModuleInfo {
  srcPath: string;
  path: string;
  name: string;
}

export function zgetModuleInfo(input: string): ModuleInfo {
  const parts = input.split('/');
  if (parts.length === 1) {
    return { path: '', srcPath: './', name: input };
  } else {
    const name = parts.pop() || '';
    const srcPath = 'tbd';
    return {
      name,
      path: parts.slice(0, parts.length).join('/'),
      srcPath,
    };
  }
}

// function getPackageNames(tree: Tree): string[] {
//   const names: string[] = [];
//   const { packages } = getFromJsonFile<ILernaJson>(tree, 'lerna.json');
//   const packageJsons = packages.map((packageGlob) =>
//     packageGlob.concat('/package.json')
//   );
//   tree.visit((path, file?: Readonly<FileEntry> | null) => {
//     if (file) {
//       for (const packageJson of packageJsons) {
//         const match = minimatch(
//           path.startsWith('/') ? path.slice(1) : path,
//           packageJson,
//           {
//             matchBase: false,
//           }
//         );
//         if (match) {
//           const pkg = JSON.parse(file.content.toString()) as IPackageJson;
//           names.push(pkg.name);
//         }
//       }
//     }
//   });
//   return names;
// }

// export default function (options: ModuleOptions): Rule {
//   const info = getModuleInfo(options.name);
//   const { srcPath, path: modulePath, name: moduleName } = info;
//   // const modulePath = info.path;
//   // const moduleName = info.name;
//   const kind = options.kind || 'values';

//   return (tree: Tree, context: SchematicContext) => {
//     const packageNames = getPackageNames(tree);
//     const packageInfo = getPackageInfo(
//       options.packageName || packageNames[0] || 'package1'
//     );
//     const templatedSource = apply(url(`./files/${kind}/src`), [
//       applyTemplates({
//         ...packageInfo,
//         ...strings,
//         modulePath,
//         moduleName,
//         srcPath,
//       }),
//     ]);
//     const templatedTests = apply(url(`./files/${kind}/test`), [
//       applyTemplates({
//         ...packageInfo,
//         ...strings,
//         modulePath,
//         moduleName,
//         srcPath,
//       }),
//     ]);

//     return chain([
//       branchAndMerge(
//         chain([
//           mergeWith(templatedSource, MergeStrategy.Overwrite),
//           options.test
//             ? mergeWith(templatedTests, MergeStrategy.Overwrite)
//             : noop(),
//         ]),
//         MergeStrategy.AllowOverwriteConflict
//       ),
//     ])(tree, context);
//   };
// }
import {
  basename,
  dirname,
  join,
  normalize,
  Path,
  strings,
} from '@angular-devkit/core';
import {
  apply,
  applyTemplates,
  filter,
  MergeStrategy,
  mergeWith,
  move,
  noop,
  Rule,
  SchematicContext,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { Options } from './schema';

interface Location {
  name: string;
  path: Path;
}

function parseName(path: string, name: string): Location {
  const nameWithoutPath = basename(normalize(name));
  const namePath = dirname(join(normalize(path), name));

  return {
    name: nameWithoutPath,
    path: normalize('/' + namePath),
  };
}

function normalizeOptions(options: Options): Options {
  return { ...options };
}

export default function (options: Options): Rule {
  const opts = normalizeOptions(options);
  const directory = opts.directory ?? '';
  const projectRoot = opts.projectRoot ?? '.';
  const parsedPath = parseName(directory, options.name);
  opts.name = parsedPath.name;
  const modulePath = parsedPath.path;
  const moduleName = opts.name;
  const srcPath = './';
  const kind = options.kind || 'values';

  return (_tree: Tree, _context: SchematicContext) => {
    const templateSource = apply(url(`./files/${kind}`), [
      opts.skipTests
        ? filter((path) => !path.endsWith('.spec.ts.template'))
        : noop(),
      applyTemplates({ ...opts, ...strings, modulePath, moduleName, srcPath }),
      move(projectRoot),
    ]);
    return mergeWith(templateSource, MergeStrategy.AllowOverwriteConflict);
  };
}
