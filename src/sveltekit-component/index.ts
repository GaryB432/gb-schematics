import type { Path } from '@angular-devkit/core';
import {
  basename,
  dirname,
  join,
  normalize,
  strings,
} from '@angular-devkit/core';
import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import {
  MergeStrategy,
  apply,
  applyTemplates,
  mergeWith,
  move,
  url,
} from '@angular-devkit/schematics';
import type { Options } from './schema';

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
  options.props ??= [];
  const properties = options.props.map((p) => {
    let [name, type] = p.split(':');
    type ??= 'unknown';
    name = strings.dasherize(name);
    const initialState: Record<string, string> = {
      number: '0',
      string: `"${name}"`,
    };
    const state = initialState[type] ?? 'undefined';

    return { name, type, state };
  });
  opts.name = parsedPath.name;
  return (tree: Tree, context: SchematicContext) => {
    if (!tree.exists(normalize(join(projectRoot, 'svelte.config.js')))) {
      context.logger.warn(`no svelte configuration found in '${projectRoot}'`);
    }
    const templateSource = apply(url('./files/v2/runes'), [
      applyTemplates({
        ...opts,
        properties,
        stamp: new Date().toLocaleDateString(),
        ...strings,
        bracify: (s: string) => '{'.concat(s).concat('}'),
      }),
      move(normalize(join(projectRoot, 'src', parsedPath.path))),
    ]);
    return mergeWith(templateSource, MergeStrategy.AllowOverwriteConflict);
  };
}
