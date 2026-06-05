import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createSchemaRegistry,
  formatSchemaValidationErrors,
  getMissingRequiredOptions,
  type JsonSchema,
  resolveOptionsFromSchema,
  validateOptionsWithDevkitSchema,
} from './schema-validator.js';

describe('schema-validator', () => {
  it('applies schema defaults during validation', async () => {
    const registry = createSchemaRegistry();
    const schema: JsonSchema = {
      properties: {
        flavor: { default: 'vanilla', type: 'string' },
      },
      type: 'object',
    };

    const result = await validateOptionsWithDevkitSchema(registry, schema, {});

    assert.equal(result.flavor, 'vanilla');
  });

  it('formats required-field errors with cli flag paths', async () => {
    const registry = createSchemaRegistry();
    const schema: JsonSchema = {
      properties: {
        name: { type: 'string' },
      },
      required: ['name'],
      type: 'object',
    };

    await assert.rejects(
      () => validateOptionsWithDevkitSchema(registry, schema, {}),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        assert.match(error.message, /Invalid schematic options\./);
        assert.match(
          error.message,
          /--name: must have required property 'name'/
        );

        const errors =
          typeof error === 'object' &&
          error !== null &&
          'errors' in error &&
          Array.isArray((error as { errors?: unknown[] }).errors)
            ? ((error as { errors: Record<string, unknown[]>[] }).errors ?? [])
            : [];

        assert.equal(getMissingRequiredOptions(errors).includes('name'), true);
        assert.match(formatSchemaValidationErrors(errors), /--name:/);
        return true;
      }
    );
  });

  it('recovers by prompting for missing required options', async () => {
    const schema: JsonSchema = {
      properties: {
        name: {
          type: 'string',
          'x-prompt': 'Name?',
        },
      },
      required: ['name'],
      type: 'object',
    };

    const prompted: string[] = [];

    const result = await resolveOptionsFromSchema(
      schema,
      {},
      () => true,
      async (optionName, _schemaProp, resolvedOptions) => {
        prompted.push(optionName);
        resolvedOptions[optionName] = 'Widget';
      }
    );

    assert.deepEqual(prompted, ['name']);
    assert.equal(result.name, 'Widget');
  });

  it('throws when required options are missing and prompting is disabled', async () => {
    const schema: JsonSchema = {
      properties: {
        name: {
          type: 'string',
        },
      },
      required: ['name'],
      type: 'object',
    };

    await assert.rejects(
      () =>
        resolveOptionsFromSchema(
          schema,
          {},
          () => false,
          async () => {
            throw new Error('should not prompt');
          }
        ),
      /Invalid schematic options\./
    );
  });
});
