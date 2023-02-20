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

export interface ModuleOptions {
  kind?: 'class' | 'values';
  name: string;
  packageName?: string;
  test?: boolean;
}

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
  const sourceRoot = opts.sourceRoot ?? 'src';
  const parsedPath = parseName(directory, options.name);
  opts.name = parsedPath.name;
  const modulePath = parsedPath.path;
  const moduleName = opts.name;
  const srcPath = './';
  const kind = options.kind || 'values';

  return (_tree: Tree, _context: SchematicContext) => {
    const templateSource = apply(url(`./files/${kind}`), [
      opts.unitTestRunner === 'none'
        ? filter((path) => !path.endsWith('.spec.ts.template'))
        : noop(),
      applyTemplates({ ...opts, ...strings, modulePath, moduleName, srcPath }),
      move(sourceRoot),
    ]);
    return mergeWith(templateSource, MergeStrategy.AllowOverwriteConflict);
  };
}
