import { TemplateOptions } from '@angular-devkit/core';
import { classify, dasherize } from '@angular-devkit/core/src/utils/strings';
import {
  apply,
  branchAndMerge,
  chain,
  MergeStrategy,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';

const stringUtils = { dasherize, classify };

export interface WebAppOptions extends TemplateOptions {
  project: string;
  // target: string;
  // configuration: string;
  title: string;
}

export function angularIisConfig(options: WebAppOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const iisAppPath = './iis-application';

    const templateSource = apply(url('./files'), [
      template({
        ...stringUtils,
        ...options,
      }),
      move(iisAppPath),
    ]);

    return chain([
      branchAndMerge(
        chain([mergeWith(templateSource, MergeStrategy.Overwrite)]),
        MergeStrategy.AllowOverwriteConflict
      ),
    ])(tree, context);
  };
}
