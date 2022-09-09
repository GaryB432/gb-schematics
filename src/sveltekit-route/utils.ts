import { normalize } from '@angular-devkit/core';

function deBracket(s: string): string {
  return s.replace(/[[\]]+/g, '_');
}
export function makeTestRoute(path: string, name: string): string {
  return normalize(
    '/'.concat(path).split('/').concat(name).map(deBracket).join('/')
  );
}
