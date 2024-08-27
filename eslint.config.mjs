import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import gb from 'eslint-plugin-gb';
import globals from 'globals';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...gb.configs['flat/recommended'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    ignores: ['node_modules/', '**/*.js'],
  }
);
