function deBracket(s: string): string {
  return s.replace(/[\[\]]+/g, '_');
}
export function makeTestRoute(path: string, name: string): string {
  return [path, deBracket(name)].join('/');
}
