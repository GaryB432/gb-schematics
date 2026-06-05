import { json } from '@angular-devkit/core';
import type { JSONSchema7, JSONSchema7Definition } from 'json-schema';

type SchematicPrompt = string | { message?: string };

export type JsonSchemaProperty = JSONSchema7 & {
  'x-prompt'?: SchematicPrompt;
  enum?: JSONSchema7['enum'];
};

export type JsonSchema = Omit<JSONSchema7, 'properties' | 'required'> & {
  required?: string[];
  properties?: Record<string, JsonSchemaProperty>;
  additionalProperties?: boolean | JsonSchemaProperty;
};

export type PromptForOption = (
  optionName: string,
  schemaProp: JsonSchemaProperty,
  resolvedOptions: Record<string, unknown>,
  requiredOptionNames: ReadonlySet<string>
) => Promise<void>;

export function asJsonSchema(schema: JSONSchema7Definition): JsonSchema {
  if (typeof schema === 'boolean') {
    return {
      type: 'object',
      additionalProperties: schema,
    };
  }

  return schema as JsonSchema;
}
function isProvided(value: unknown): boolean {
  return value !== undefined && value !== null && value !== '';
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

export function createSchemaRegistry(): json.schema.CoreSchemaRegistry {
  const registry = new json.schema.CoreSchemaRegistry();
  registry.addPostTransform(json.schema.transforms.addUndefinedDefaults);
  // Register known schematic formats up front to prevent noisy unknown-format warnings.
  registry.addFormat({
    name: 'path',
    formatter: {
      type: 'string',
      validate: (value: string) =>
        typeof value === 'string' && !value.includes('\0'),
    },
  });

  return registry;
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
    ) as Error & {
      errors: readonly json.schema.SchemaValidatorError[];
    };
    validationError.errors = errors;
    throw validationError;
  }

  return (result.data as Record<string, unknown>) ?? options;
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
