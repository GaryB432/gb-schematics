import assert from 'node:assert/strict';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing/index.js';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';

import { bumpParts } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const collectionPath = path.join(__dirname, '../../dist/collection.json');

describe('bump', () => {
  it('keeps schema enum in sync with runtime allowed parts', () => {
    const schemaPath = path.join(__dirname, 'schema.json');
    const schema = JSON.parse(readFileSync(schemaPath, 'utf8')) as {
      properties?: {
        part?: {
          enum?: string[];
        };
      };
    };

    assert.deepEqual(schema.properties?.part?.enum, [...bumpParts]);
  });

  it('works', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    ftree.create('package.json', JSON.stringify({ name: 'test', version: '1.2.3' }));
    const tree = await runner.runSchematic('bump', { part: 'prerelease', tag: 'too-fun' }, ftree);
    const buff = tree.read('package.json');

    const newPJ = buff ? JSON.parse(buff.toString()) : {};

    assert.equal(newPJ.version, '1.2.4-too-fun.0');
  });

  it('throws for invalid bump part values', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const ftree = Tree.empty();
    ftree.create('package.json', JSON.stringify({ name: 'test', version: '1.2.3' }));

    const allowedValuesMessage = bumpParts.map((part) => JSON.stringify(part)).join(', ');

    await assert.rejects(
      runner.runSchematic('bump', { part: 'wtf' }, ftree),
      new RegExp(
        `Allowed values are: ${allowedValuesMessage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.`,
      ),
    );
  });
});
