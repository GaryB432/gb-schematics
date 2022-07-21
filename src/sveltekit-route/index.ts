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

function normalizeOptions(o: Options): Required<Options> {
  const path = o.path ?? '';
  const style = o.style ?? 'none';
  const endpoint = o.endpoint ?? false;
  const skipTests = o.skipTests ?? false;
  return { ...o, path, style, skipTests, endpoint };
}

export default function (opts: Options): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    if (!tree.exists('svelte.config.js')) {
      context.logger.warn('no svelte configuration');
    }

    const options = normalizeOptions(opts);

    const parsedPath = parseName(options.path, options.name);
    options.name = parsedPath.name;
    options.path = parsedPath.path;
    const templateSource = apply(url('./files'), [
      filter((path) => {
        switch (path) {
          case '/src/routes/__name@dasherize__.svelte.template': {
            return !options.endpoint;
          }
          case '/src/routes/__name@dasherize__/index.svelte.template':
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
