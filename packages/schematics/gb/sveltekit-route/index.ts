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
  chain,
  mergeWith,
  move,
  url,
} from '@angular-devkit/schematics';
import { Load, Style, type Schema as Options } from './schema';
import { makeTestRoute } from './utils';

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
  const style = o.style ?? Style.css;
  const load = o.load ?? Load.none;
  const skipTests = o.skipTests ?? false;
  const projectRoot = o.projectRoot ?? '.';
  return { ...o, path, style, skipTests, load, projectRoot };
}

export default function (opts: Options): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const options = normalizeOptions(opts);
    if (!tree.exists(join(options.projectRoot as Path, 'svelte.config.js'))) {
      context.logger.warn('no svelte configuration');
    }

    const parsedPath = parseName(options.path, options.name);
    options.name = parsedPath.name;
    options.path = parsedPath.path;
    const templateSource = apply(
      url(join('.' as Path, 'files', 'load', options.load)),
      [
        applyTemplates({
          ...strings,
          ...options,
        }),
        move(
          join(
            options.projectRoot as Path,
            'src',
            'routes',
            parsedPath.path,
            parsedPath.name
          )
        ),
      ]
    );
    const route = makeTestRoute(options.path, options.name);
    const testSource = apply(url('./files/test'), [
      applyTemplates({
        ...strings,
        ...options,
        route,
      }),
      move(join(options.projectRoot as Path, 'tests', parsedPath.path)),
    ]);
    const rules = [
      mergeWith(templateSource, MergeStrategy.AllowOverwriteConflict),
    ];
    if (!options.skipTests) {
      rules.push(mergeWith(testSource, MergeStrategy.AllowOverwriteConflict));
    }
    return chain(rules);
  };
}
