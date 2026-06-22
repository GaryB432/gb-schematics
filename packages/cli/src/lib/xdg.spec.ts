import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { add, greet, meaning } from './xdg.js';

describe('Xdg', () => {
  test('adds', () => {
    assert.equal(add(2, 3), 5);
  });
  test('greets', () => {
    assert.equal(greet('world'), 'xdg says: hello to world');
  });
  test('meaning', () => {
    assert.equal(meaning.life, 41);
  });
});
