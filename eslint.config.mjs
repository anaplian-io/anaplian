import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['**/coverage/', '**/dist/', 'node_modules/'],
  },
  {
    files: ['**/*.{ts}'],
    languageOptions: { globals: globals.browser },
  },
  ...tseslint.configs.recommended,
];
