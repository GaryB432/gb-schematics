import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import gb from 'eslint-plugin-gb';

/** @type {import('eslint').Linter.Config[]} */
export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...gb.configs['flat/recommended'],
  {
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    ignores: ['node_modules/', '**/*.js', '**/*.d.ts'],
  }
);
