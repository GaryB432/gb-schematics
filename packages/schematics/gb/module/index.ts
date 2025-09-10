import { strings } from '@angular-devkit/core';

import type { Rule } from '@angular-devkit/schematics';
import {
  apply,
  applyTemplates,
  chain,
  filter,
  mergeWith,
  move,
  noop,
  url,
} from '@angular-devkit/schematics';
import { parseName } from '../utility/parse-name';
import type { Schema } from './schema';

const globalTestRunners = {
  jest: '@jest/globals',
  native: 'node:test',
  none: '',
  vitest: 'vitest',
};

function normalizeOptions(options: Schema): Schema {
  return { ...options };
}

export default function (options: Schema): Rule {
  const opts = normalizeOptions(options);
  const directory = opts.directory ?? '';
  const sourceRoot = opts.sourceRoot ?? '';
  const parsedPath = parseName(directory, options.name);
  opts.name = parsedPath.name;
  const modulePath = parsedPath.path;
  const moduleName = opts.name;
  const srcPath = './';
  const kind = options.kind || 'values';
  const globalTestModule = globalTestRunners[opts.unitTestRunner ?? 'none'];
  const moduleFileName = options.pascalCaseFiles
    ? strings.classify(moduleName)
    : strings.dasherize(moduleName);

  return chain([
    mergeWith(
      apply(url(`./files/${kind}`), [
        opts.unitTestRunner === 'none'
          ? filter((path) => !path.endsWith('.spec.__language__.template'))
          : noop(),
        applyTemplates({
          ...opts,
          ...strings,
          globalTestModule,
          modulePath,
          moduleName,
          moduleFileName,
          srcPath,
        }),
        move(sourceRoot),
      ])
    ),
  ]);
}
