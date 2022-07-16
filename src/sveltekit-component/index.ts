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
  style: string;
}

export default function (options: Options): Rule {
  return (_tree: Tree, _context: SchematicContext) => {
    const urlString = './files';
    const templateSource = apply(url(urlString), [
      applyTemplates({ ...options, ...strings }),
    ]);
    return mergeWith(templateSource, MergeStrategy.AllowOverwriteConflict);
  };
}
