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

function normalizeOptions(options: Options): Options {
  return { ...options };
}

export default function (options: Options): Rule {
  const opts = normalizeOptions(options);
  const directory = opts.directory ?? 'lib/components';
  const projectRoot = (opts.projectRoot ?? '.') as Path;
  const parsedPath = parseName(directory, options.name);
  opts.name = parsedPath.name;
  return (tree: Tree, context: SchematicContext) => {
    if (!tree.exists(normalize(join(projectRoot, 'svelte.config.js')))) {
      context.logger.warn(`no svelte configuration found in '${projectRoot}'`);
    }
    const templateSource = apply(url('./files'), [
      applyTemplates({ ...opts, ...strings }),
      move(normalize(join(projectRoot, 'src', parsedPath.path))),
    ]);
    return mergeWith(templateSource, MergeStrategy.AllowOverwriteConflict);
  };
}
