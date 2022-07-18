import { strings } from '@angular-devkit/core';
import {
  apply,
  applyTemplates,
  MergeStrategy,
  mergeWith,
  Rule,
  SchematicContext,
  Tree,
  url,
} from '@angular-devkit/schematics';

interface Options {
  name: string;
  project: string;
  directory?: string;
  style: string;
}

function normalizeOptions(options: Options): Options {
  return { ...options, directory: options.directory ?? 'lib/components' };
}

export default function (options: Options): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (!tree.exists('svelte.config.js')) {
      context.logger.warn('no svelte configuration');
    }
    const urlString = './files';
    const templateSource = apply(url(urlString), [
      applyTemplates({ ...normalizeOptions(options), ...strings }),
    ]);
    return mergeWith(templateSource, MergeStrategy.AllowOverwriteConflict);
  };
}
