import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { makeTestRoute } from './utils.js';

describe('utils', () => {
  it('makes route a', async () => {
    assert.equal(makeTestRoute('/', 'd'), '/d');
  });
  it('makes route b', async () => {
    assert.equal(makeTestRoute('/a/b/c', 'd'), '/a/b/c/d');
  });
  it('makes route c', async () => {
    assert.equal(makeTestRoute('a/b/c', 'd'), '/a/b/c/d');
  });
  it('makes route d', async () => {
    assert.equal(makeTestRoute('c', 'd'), '/c/d');
  });
  it('makes route e', async () => {
    assert.equal(makeTestRoute('[c]', 'd'), '/_c_/d');
  });
  it('makes route f', async () => {
    assert.equal(makeTestRoute('b/[c]', 'd'), '/b/_c_/d');
  });
  it('makes bracket route', async () => {
    assert.equal(makeTestRoute('/a/b/c', '[testid]'), '/a/b/c/_testid_');
  });
  it('makes multi bracket route', async () => {
    assert.equal(makeTestRoute('/a/[b]/c', '[testid]'), '/a/_b_/c/_testid_');
  });
});
