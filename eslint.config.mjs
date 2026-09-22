import js from "@eslint/js";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import perfectionist from "eslint-plugin-perfectionist";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  { linterOptions: { reportUnusedDisableDirectives: "error" } },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: {
          allowDefaultProject: ["tools/generate-schema-types.mjs"],
          defaultProject: "tsconfig.json", // Often optional but good to explicitly define
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },

    ...js.configs.recommended,
    ...perfectionist.configs["recommended-natural"],
    rules: {
      "no-console": ["error"],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "all",
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
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
    ignores: ["node_modules", "legacy", "**/*.config.mjs"],
  },
]);
