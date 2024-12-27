import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['**/*.{ts}'],
    ignores: ['coverage/', 'dist/', 'node_modules/'],
  },
  { languageOptions: { globals: globals.browser } },
  ...tseslint.configs.recommended,
];
