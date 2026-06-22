import * as os from 'os';
import * as path from 'path';

export function add(a: number, b: number): number {
  return a + b;
}
export function greet(name: string): string {
  return `xdg says: hello to ${name}`;
}
export const meaning: { life: number } = {
  life: 42,
};

export function getAppPaths(appName: string) {
  const home = os.homedir();

  return {
    cache: process.env.XDG_CACHE_HOME
      ? path.join(process.env.XDG_CACHE_HOME, appName)
      : path.join(home, '.cache', appName),

    config: process.env.XDG_CONFIG_HOME
      ? path.join(process.env.XDG_CONFIG_HOME, appName)
      : path.join(home, '.config', appName),

    data: process.env.XDG_DATA_HOME
      ? path.join(process.env.XDG_DATA_HOME, appName)
      : path.join(home, '.local', 'share', appName),
  };
}
