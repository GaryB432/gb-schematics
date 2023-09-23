import {
  basename,
  dirname,
  join,
  normalize,
  strings,
} from '@angular-devkit/core';

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
import type { Options } from './schema';

const globalTestRunners = {
  jest: '@jest/globals',
  none: '',
  vitest: 'vitest',
};

export function parseName(
  path: string,
  name: string
): { name: string; path: string } {
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
  const directory = opts.directory ?? '';
  const sourceRoot = opts.sourceRoot ?? '';
  const parsedPath = parseName(directory, options.name);
  opts.name = parsedPath.name;
  const modulePath = parsedPath.path;
  const moduleName = opts.name;
  const srcPath = './';
  const kind = options.kind || 'values';
  const globalTestModule = globalTestRunners[opts.unitTestRunner ?? 'none'];

  return chain([
    mergeWith(
      apply(url(`./files/${kind}`), [
        opts.unitTestRunner === 'none'
          ? filter((path) => !path.endsWith('.spec.ts.template'))
          : noop(),
        applyTemplates({
          ...opts,
          ...strings,
          globalTestModule,
          modulePath,
          moduleName,
          srcPath,
        }),
        move(sourceRoot),
      ])
    ),
  ]);
}
