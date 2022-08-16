function deBracket(s: string): string {
  return s.replace(/[\[\]]+/g, '_');
}
export function makeTestRoute(path: string, name: string): string {
  console.log({ path, name });
  const pd = path === '/' ? '' : path;
  return [pd, deBracket(name)].join('/');
}
