import js from '@eslint/js';
import gb from 'eslint-plugin-gb';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  tseslint.configs.recommended,
  gb.configs['flat/recommended'],
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js, gb },
    extends: ['js/recommended'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'no-unused-vars': 'off',
      'no-undef': 'off',
    },
  },
  {
    files: ['*.ts', '*.mts', '*.cts', '*.tsx'],
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
    },
  },
  {
    ignores: ['**/*.d.ts', '**/*.js', '**/coverage', '**/bangular/**'],
  },
]);
