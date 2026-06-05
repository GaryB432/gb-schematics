import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, it } from 'node:test';
import { spawnSync } from 'node:child_process';

function createFixtureCollectionPackage(): {
  tmpRoot: string;
  collectionName: string;
} {
  const tmpRoot = mkdtempSync(join(tmpdir(), 'gb-schematics-cli-'));
  const collectionName = 'fixture-schematics';
  const pkgRoot = join(tmpRoot, 'node_modules', collectionName);
  const schematicRoot = join(pkgRoot, 'demo');

  mkdirSync(schematicRoot, { recursive: true });

  writeFileSync(
    join(pkgRoot, 'package.json'),
    JSON.stringify(
      {
        name: collectionName,
        version: '0.0.0-test',
        type: 'module',
        schematics: './collection.json',
      },
      null,
      2
    )
  );

  writeFileSync(
    join(pkgRoot, 'collection.json'),
    JSON.stringify(
      {
        schematics: {
          demo: {
            description: 'Fixture schematic',
            factory: './demo/index.js',
            schema: './demo/schema.json',
          },
        },
      },
      null,
      2
    )
  );

  writeFileSync(
    join(schematicRoot, 'index.js'),
    [
      '/** @returns {(tree: unknown) => unknown} */',
      'export default function fixtureSchematic() {',
      '  return (tree) => tree;',
      '}',
      '',
    ].join('\n')
  );

  writeFileSync(
    join(schematicRoot, 'schema.json'),
    JSON.stringify(
      {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name of generated thing',
          },
        },
        required: ['name'],
        additionalProperties: false,
      },
      null,
      2
    )
  );

  return { tmpRoot, collectionName };
}

describe('cli integration', () => {
  it('prints required-option validation failure in CI mode', () => {
    const { tmpRoot, collectionName } = createFixtureCollectionPackage();

    try {
      const result = spawnSync(
        process.execPath,
        ['dist/index.js', 'generate', 'demo', '--collection', collectionName],
        {
          cwd: process.cwd(),
          env: {
            ...process.env,
            CI: '1',
            NODE_PATH: join(tmpRoot, 'node_modules'),
          },
          encoding: 'utf8',
        }
      );

      assert.equal(result.status, 1);
      assert.match(result.stderr, /Failed: Invalid schematic options\./);
      assert.match(result.stderr, /--name: must have required property 'name'/);
    } finally {
      rmSync(tmpRoot, { recursive: true, force: true });
    }
  });
});
