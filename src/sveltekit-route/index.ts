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
  chain,
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
    const templateSource = apply(url('./files/v0'), [
      applyTemplates({
        ...strings,
        ...options,
      }),
      move(`src/routes/${parsedPath.path}/${parsedPath.name}`),
    ]);
    const testSource = apply(url('./files/test'), [
      applyTemplates({
        ...strings,
        ...options,
      }),
      move(`tests/${parsedPath.path}`),
    ]);
    return chain([
      mergeWith(templateSource, MergeStrategy.AllowOverwriteConflict),
      mergeWith(testSource, MergeStrategy.AllowOverwriteConflict),
    ]);
  };
}
