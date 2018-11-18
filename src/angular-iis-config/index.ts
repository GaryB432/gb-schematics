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
  SchematicsException,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';

import { getProject } from '../utility/project';

import { AngularIISConfigOptionsSchema as WebAppOptions } from './schema';

const stringUtils = { dasherize, classify };

export function angularIisConfig(options: WebAppOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (!options.project) {
      throw new SchematicsException(`Invalid options, "project" is required.`);
    }
    const project = getProject(tree, options.project);
    if (!project) {
      throw new SchematicsException(`Project "${options.project}" not found.`);
    }
    const iisAppPath = `${project.root}./iis-application`;

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
