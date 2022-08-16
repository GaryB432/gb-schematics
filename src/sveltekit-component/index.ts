import { normalize, strings } from '@angular-devkit/core';
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
import { join } from 'path';
import { Options } from './schema';

function normalizeOptions(options: Options): Options {
  return { ...options };
}

export default function (options: Options): Rule {
  const opts = normalizeOptions(options);
  const directory = opts.directory ?? 'lib/components';
  const projectRoot = opts.projectRoot ?? '.';
  return (tree: Tree, context: SchematicContext) => {
    if (!tree.exists(normalize(join(projectRoot, 'svelte.config.js')))) {
      context.logger.warn(`no svelte configuration found in '${projectRoot}'`);
    }
    const templateSource = apply(url('./files'), [
      applyTemplates({ ...opts, ...strings }),
      move(normalize(join(projectRoot, 'src', directory))),
    ]);
    return mergeWith(templateSource, MergeStrategy.AllowOverwriteConflict);
  };
}
