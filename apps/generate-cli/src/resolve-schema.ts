import { readFile } from 'node:fs/promises';
import { resolve as resolvePath } from 'node:path';

export interface JsonSchemaProperty {
  type?: string | string[];
  enum?: unknown[];
  default?: unknown;
  description?: string;
  format?: string;
  alias?: string;
  'x-prompt'?: string | { message: string };
  '$default'?: { '$source': string; index?: number };
}

export interface JsonSchema {
  $schema?: string;
  $id?: string;
  title?: string;
  type?: string;
  description?: string;
  additionalProperties?: boolean;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
}

/**
 * Loads and parses the JSON Schema file referenced by a collection entry.
 *
 * @param collectionDir  Absolute path to the directory that contains
 *                       `collection.json` — schema paths are resolved relative
 *                       to this directory.
 * @param schemaRelativePath  Value of the `schema` field from the collection
 *                            entry (e.g. `"./module/schema.json"`).
 */
export async function resolveSchema(
  collectionDir: string,
  schemaRelativePath: string
): Promise<JsonSchema> {
  const schemaPath = resolvePath(collectionDir, schemaRelativePath);
  const contents = await readFile(schemaPath, 'utf-8');
  return JSON.parse(contents) as JsonSchema;
}

/**
 * Returns the human-readable prompt message for a schema property, falling
 * back to the property description or a generic label.
 */
export function getPromptMessage(
  schemaProp: JsonSchemaProperty,
  optionName: string
): string {
  const prompt = schemaProp['x-prompt'];
  if (typeof prompt === 'string' && prompt.trim().length > 0) {
    return prompt;
  }
  if (
    typeof prompt === 'object' &&
    prompt !== null &&
    typeof prompt.message === 'string' &&
    prompt.message.trim().length > 0
  ) {
    return prompt.message;
  }
  return schemaProp.description ?? `Enter value for ${optionName}`;
}
