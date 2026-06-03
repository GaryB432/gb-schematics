import { strings } from '@angular-devkit/core';
import {
  apply,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';

export function moduleSchematic(options: { name: string }): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const sourceTemplates = url('./files');
    const sourceParametrizedTemplates = apply(sourceTemplates, [
      template({
        ...strings,
        ...options,
      }),
      move('src/app'),
    ]);
    return mergeWith(sourceParametrizedTemplates)(tree, context);
  };
}
