/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseName } from './parse-name.js';

describe('parse-name', () => {
  it('should handle just the name', () => {
    const result = parseName('src/app', 'foo');
    assert.equal(result.name, 'foo');
    assert.equal(result.path, '/src/app');
  });

  it('should handle no path', () => {
    const result = parseName('', 'foo');
    assert.equal(result.name, 'foo');
    assert.equal(result.path, '/');
  });

  it('should handle name has a path (sub-dir)', () => {
    const result = parseName('src/app', 'bar/foo');
    assert.equal(result.name, 'foo');
    assert.equal(result.path, '/src/app/bar');
  });

  it('should handle name has a higher path', () => {
    const result = parseName('src/app', '../foo');
    assert.equal(result.name, 'foo');
    assert.equal(result.path, '/src');
  });

  it('should handle name has a higher path above root', () => {
    assert.throws(() => parseName('src/app', '../../../foo'));
  });

  it('should handle Windows paths', () => {
    const result = parseName('', 'foo\\bar\\baz');
    assert.equal(result.name, 'baz');
    assert.equal(result.path, '/foo/bar');
  });
});
