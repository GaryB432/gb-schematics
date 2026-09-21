import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Tree } from '@angular-devkit/schematics';
import { type PackageJson, readPackageJson } from './package-config.js';
// import { add, greet, meaning } from './package-config';

describe('PackageConfig', () => {
  it('adds', () => {
    const ftree = Tree.empty();
    const pkg: PackageJson = {
      dependencies: { tbd: '^0.0.0' },
    };
    ftree.create('package.json', JSON.stringify(pkg));
    assert.equal(readPackageJson(ftree).dependencies?.tbd, '^0.0.0');
  });
});
