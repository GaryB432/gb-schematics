import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  getPromptMessage,
  resolveSchema,
  type JsonSchemaProperty,
} from '../src/resolve-schema.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const collectionDir = join(__dirname, 'fixtures', 'test-collection');

describe('resolveSchema', () => {
  describe('loading', () => {
    it('loads a schema from a relative path within the collection dir', async () => {
      const schema = await resolveSchema(collectionDir, './module/schema.json');

      expect(schema).toBeDefined();
      expect(schema.$schema).toBe('http://json-schema.org/draft-07/schema#');
    });

    it('exposes schema properties', async () => {
      const schema = await resolveSchema(collectionDir, './module/schema.json');

      expect(schema.properties).toBeDefined();
      expect(Object.keys(schema.properties!)).toContain('name');
      expect(Object.keys(schema.properties!)).toContain('kind');
      expect(Object.keys(schema.properties!)).toContain('language');
    });

    it('exposes required fields', async () => {
      const schema = await resolveSchema(collectionDir, './module/schema.json');

      expect(schema.required).toContain('name');
    });

    it('exposes x-prompt for interactive properties', async () => {
      const schema = await resolveSchema(collectionDir, './module/schema.json');

      expect(schema.properties!['name']!['x-prompt']).toBe(
        'What name would you like to use for the module?'
      );
      expect(schema.properties!['kind']!['x-prompt']).toBe(
        'Select module kind.'
      );
    });

    it('properties without x-prompt have no x-prompt field', async () => {
      const schema = await resolveSchema(collectionDir, './module/schema.json');

      // sourceRoot has no x-prompt in the fixture
      expect(schema.properties!['sourceRoot']!['x-prompt']).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('throws when the schema file does not exist', async () => {
      await expect(
        resolveSchema(collectionDir, './nonexistent/schema.json')
      ).rejects.toThrow();
    });

    it('throws when the path is outside the collection dir', async () => {
      await expect(
        resolveSchema(collectionDir, './component/schema.json')
      ).rejects.toThrow();
    });
  });
});

describe('getPromptMessage', () => {
  it('returns a string x-prompt directly', () => {
    const prop: JsonSchemaProperty = {
      'x-prompt': 'Enter the name',
    };
    expect(getPromptMessage(prop, 'name')).toBe('Enter the name');
  });

  it('returns message from an object x-prompt', () => {
    const prop: JsonSchemaProperty = {
      'x-prompt': { message: 'Pick a value' },
    };
    expect(getPromptMessage(prop, 'kind')).toBe('Pick a value');
  });

  it('falls back to description when x-prompt is absent', () => {
    const prop: JsonSchemaProperty = {
      description: 'The source root path',
    };
    expect(getPromptMessage(prop, 'sourceRoot')).toBe('The source root path');
  });

  it('falls back to a generic label when neither x-prompt nor description is set', () => {
    const prop: JsonSchemaProperty = {};
    expect(getPromptMessage(prop, 'myOption')).toBe(
      'Enter value for myOption'
    );
  });
});
