module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['tsconfig.eslint.json'],
  },
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  plugins: ['gb'],
  extends: ['plugin:gb/recommended'],
  rules: {
    '@typescript-eslint/unbound-method': 'error',
    "@typescript-eslint/consistent-type-imports": "error",
  },
};
