import js from "@eslint/js";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import perfectionist from "eslint-plugin-perfectionist";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: { globals: globals.node },
    ...js.configs.recommended,
    ...perfectionist.configs["recommended-natural"],
    rules: {
      "no-console": ["error"],
    },
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.json"],
    language: "json/jsonc",
    plugins: { json },
    rules: { ...json.configs.recommended.rules },
  },
  {
    files: ["**/*.md"],
    language: "markdown/gfm",
    plugins: { markdown },
    rules: { ...markdown.configs.recommended.rules },
  },
  {
    ignores: ["node_modules", "pm/templates"],
  },
]);
