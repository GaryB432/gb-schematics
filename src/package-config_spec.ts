import { Tree } from '@angular-devkit/schematics';
import { type PackageJson, readPackageJson } from './package-config';
// import { add, greet, meaning } from './package-config';

describe('PackageConfig', () => {
  it('adds', () => {
    const ftree = Tree.empty();
    const pkg: PackageJson = {
      dependencies: { tbd: '^0.0.0' },
    };
    ftree.create('package.json', JSON.stringify(pkg));
    expect(readPackageJson(ftree).dependencies!['tbd']).toEqual('^0.0.0');
  });
});
