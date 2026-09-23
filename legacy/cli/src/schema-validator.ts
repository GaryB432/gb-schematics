import type { JSONSchema7, JSONSchema7Definition } from 'json-schema';

import { json } from '@angular-devkit/core';

export type JsonSchema = {
  additionalProperties?: boolean | JsonSchemaProperty;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
} & Omit<JSONSchema7, 'properties' | 'required'>;

export type JsonSchemaProperty = {
  enum?: JSONSchema7['enum'];
  'x-prompt'?: SchematicPrompt;
} & JSONSchema7;

export type PromptForOption = (
  optionName: string,
  schemaProp: JsonSchemaProperty,
  resolvedOptions: Record<string, unknown>,
  requiredOptionNames: ReadonlySet<string>
) => Promise<void>;

type SchematicPrompt = { message?: string } | string;

export function asJsonSchema(schema: JSONSchema7Definition): JsonSchema {
  if (typeof schema === 'boolean') {
    return {
      additionalProperties: schema,
      type: 'object',
    };
  }

  return schema as JsonSchema;
}
export function createSchemaRegistry(): json.schema.CoreSchemaRegistry {
  const registry = new json.schema.CoreSchemaRegistry();
  registry.addPostTransform(json.schema.transforms.addUndefinedDefaults);
  // Register known schematic formats up front to prevent noisy unknown-format warnings.
  registry.addFormat({
    formatter: {
      type: 'string',
      validate: (value: string) =>
        typeof value === 'string' && !value.includes('\0'),
    },
    name: 'path',
  });

  return registry;
}

export function formatSchemaValidationErrors(
  errors: readonly json.schema.SchemaValidatorError[]
): string {
  return errors
    .map((error) => {
      const missingProperty =
        error.keyword === 'required' &&
        typeof error.params === 'object' &&
        error.params !== null &&
        'missingProperty' in error.params
          ? String(
              (error.params as { missingProperty: string }).missingProperty
            )
          : undefined;

      const location = formatSchemaErrorPath(
        error.instancePath,
        missingProperty
      );
      const message = error.message ?? 'Invalid value';

      return `${location}: ${message}`;
    })
    .join('\n');
}

export function getMissingRequiredOptions(
  errors: readonly json.schema.SchemaValidatorError[] = []
): string[] {
  const missing = new Set<string>();

  for (const error of errors) {
    if (error.keyword !== 'required') {
      continue;
    }

    if (
      typeof error.params === 'object' &&
      error.params !== null &&
      'missingProperty' in error.params
    ) {
      const missingProperty = String(
        (error.params as { missingProperty: string }).missingProperty
      );
      if (missingProperty) {
        missing.add(missingProperty);
      }
    }
  }

  return [...missing];
}

export async function resolveOptionsFromSchema(
  schema: JsonSchema,
  initialOptions: Record<string, unknown>,
  canPrompt: () => boolean,
  promptForOption: PromptForOption
): Promise<Record<string, unknown>> {
  const properties = schema.properties ?? {};
  const requiredOptionNames = new Set(schema.required ?? []);
  const resolvedOptions: Record<string, unknown> = { ...initialOptions };
  const registry = createSchemaRegistry();

  if (canPrompt()) {
    const promptableOptions = Object.entries(properties)
      .filter(
        ([optionName, schemaProp]) =>
          !isProvided(resolvedOptions[optionName]) &&
          isProvided(schemaProp['x-prompt'])
      )
      .map(([optionName]) => optionName);

    for (const optionName of promptableOptions) {
      const schemaProp = properties[optionName] ?? {};
      await promptForOption(
        optionName,
        schemaProp,
        resolvedOptions,
        requiredOptionNames
      );
    }
  }

  for (;;) {
    try {
      return await validateOptionsWithDevkitSchema(
        registry,
        schema,
        resolvedOptions
      );
    } catch (error: unknown) {
      const validationErrors =
        typeof error === 'object' &&
        error !== null &&
        'errors' in error &&
        Array.isArray((error as { errors?: unknown[] }).errors)
          ? ((error as { errors: json.schema.SchemaValidatorError[] }).errors ??
            [])
          : [];

      const missingRequired = getMissingRequiredOptions(
        validationErrors
      ).filter((name) => !isProvided(resolvedOptions[name]));

      if (!missingRequired.length || !canPrompt()) {
        throw error;
      }

      for (const optionName of missingRequired) {
        const schemaProp = properties[optionName] ?? {};
        await promptForOption(
          optionName,
          schemaProp,
          resolvedOptions,
          requiredOptionNames
        );
      }
    }
  }
}

export async function validateOptionsWithDevkitSchema(
  registry: json.schema.CoreSchemaRegistry,
  schema: JsonSchema,
  options: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const validator = await registry.compile(schema as json.JsonObject);
  const result = await validator(options as unknown as json.JsonValue);

  if (!result.success) {
    const errors = result.errors ?? [];
    const details = result.errors?.length
      ? `\n${formatSchemaValidationErrors(result.errors)}`
      : '';
    const validationError = new Error(
      `Invalid schematic options.${details}`
    ) as {
      errors: readonly json.schema.SchemaValidatorError[];
    } & Error;
    validationError.errors = errors;
    throw validationError;
  }

  return (result.data as Record<string, unknown>) ?? options;
}

function formatSchemaErrorPath(
  instancePath?: string,
  propertyName?: string
): string {
  if (instancePath && instancePath.length > 1) {
    return `--${instancePath.slice(1).replace(/\//g, '.')}`;
  }

  if (propertyName) {
    return `--${propertyName}`;
  }

  return 'options';
}

function isProvided(value: unknown): boolean {
  return value !== undefined && value !== null && value !== '';
}
