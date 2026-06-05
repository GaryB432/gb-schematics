import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createSchemaRegistry,
  formatSchemaValidationErrors,
  getMissingRequiredOptions,
  resolveOptionsFromSchema,
  validateOptionsWithDevkitSchema,
  type JsonSchema,
} from './schema-validator.js';

describe('schema-validator', () => {
  it('applies schema defaults during validation', async () => {
    const registry = createSchemaRegistry();
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        flavor: { type: 'string', default: 'vanilla' },
      },
    };

    const result = await validateOptionsWithDevkitSchema(registry, schema, {});

    assert.equal(result.flavor, 'vanilla');
  });

  it('formats required-field errors with cli flag paths', async () => {
    const registry = createSchemaRegistry();
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
      required: ['name'],
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
            ? // eslint-disable-next-line
              ((error as { errors: any[] }).errors ?? [])
            : [];

        assert.equal(getMissingRequiredOptions(errors).includes('name'), true);
        assert.match(formatSchemaValidationErrors(errors), /--name:/);
        return true;
      }
    );
  });

  it('recovers by prompting for missing required options', async () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          'x-prompt': 'Name?',
        },
      },
      required: ['name'],
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
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
      },
      required: ['name'],
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
