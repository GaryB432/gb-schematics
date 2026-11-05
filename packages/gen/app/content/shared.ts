export const IMPORT_VITEST = ["import { describe, expect, it } from 'vitest';", ""];

export function simplePascalCase(str: string): string {
  return str
    .toLowerCase()
    .replace(new RegExp(/[-_ ]+/, "g"), " ")
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
    .replace(/\s+/g, "");
}

export function simpleSnakeCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/[-_ ]+/g, "_")
    .replace(/(^_+|_+$)/g, "");
}
