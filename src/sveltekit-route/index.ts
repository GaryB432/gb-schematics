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
  FileOperator,
  filter,
  forEach,
  MergeStrategy,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  Tree,
  url,
} from '@angular-devkit/schematics';

interface Options {
  path: string;
  endpoint: boolean;
  name: string;
  skipTests: boolean;
  style: string;
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

export default function (options: Options): Rule {
  return async (_tree: Tree, _context: SchematicContext) => {
    options.path = options.path ?? '';

    const parsedPath = parseName(options.path as string, options.name);
    options.name = parsedPath.name;
    options.path = parsedPath.path;
    const templateSource = apply(url('./files'), [
      filter((path) => {
        switch (path) {
          case '/src/routes/__name@dasherize__.svelte.template': {
            return !options.endpoint;
          }
          case '/src/routes/__name@dasherize__/index.svelte.template': {
            return options.endpoint;
          }
          case '/src/routes/__name@dasherize__/index.ts.template': {
            return options.endpoint;
          }
          case '/tests/__name@dasherize__.spec.ts.template': {
            return !options.skipTests;
          }
        }

        throw new Error('unrecognized template');
      }),
      applyTemplates({
        ...strings,
        ...options,
      }),
      move(parsedPath.path),
    ]);

    return mergeWith(templateSource, MergeStrategy.AllowOverwriteConflict);
  };
}