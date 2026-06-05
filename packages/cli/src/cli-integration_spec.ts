import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

function createFixtureCollectionPackage(): {
  collectionName: string;
  tmpRoot: string;
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
        schematics: './collection.json',
        type: 'module',
        version: '0.0.0-test',
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
        additionalProperties: false,
        properties: {
          name: {
            description: 'Name of generated thing',
            type: 'string',
          },
        },
        required: ['name'],
        type: 'object',
      },
      null,
      2
    )
  );

  return { collectionName, tmpRoot };
}

describe('cli integration', () => {
  it('prints required-option validation failure in CI mode', () => {
    const { collectionName, tmpRoot } = createFixtureCollectionPackage();

    try {
      const result = spawnSync(
        process.execPath,
        ['dist/index.js', 'generate', 'demo', '--collection', collectionName],
        {
          cwd: process.cwd(),
          encoding: 'utf8',
          env: {
            ...process.env,
            CI: '1',
            NODE_PATH: join(tmpRoot, 'node_modules'),
          },
        }
      );

      assert.equal(result.status, 1);
      assert.match(result.stderr, /Failed: Invalid schematic options\./);
      assert.match(result.stderr, /--name: must have required property 'name'/);
    } finally {
      rmSync(tmpRoot, { force: true, recursive: true });
    }
  });
});
