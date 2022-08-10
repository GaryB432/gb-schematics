export function makeTestRoute(path: string, name: string): string {
  return [path, name].join('/');
}
