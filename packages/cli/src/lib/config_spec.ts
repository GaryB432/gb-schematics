import assert from 'node:assert';
import os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';

import { getAppPaths } from './config.js';

describe('getAppPaths - XDG Citizen Directory Resolution', () => {
  const originalEnv = { ...process.env };
  const dummyHome = '/home/testuser';

  beforeEach(() => {
    process.env = { ...originalEnv };

    // Use the top-level mock tracker directly
    mock.method(os, 'homedir', () => dummyHome);
  });

  afterEach(() => {
    process.env = originalEnv;
    mock.restoreAll(); // Cleanly resets all global mocks
  });

  it('should use default fallback paths when XDG variables are missing', () => {
    delete process.env.XDG_CONFIG_HOME;
    delete process.env.XDG_DATA_HOME;
    delete process.env.XDG_CACHE_HOME;

    const paths = getAppPaths('gb-schematics');

    assert.strictEqual(
      paths.config,
      path.join(dummyHome, '.config', 'gb-schematics')
    );
    assert.strictEqual(
      paths.data,
      path.join(dummyHome, '.local', 'share', 'gb-schematics')
    );
    assert.strictEqual(
      paths.cache,
      path.join(dummyHome, '.cache', 'gb-schematics')
    );
  });
});
