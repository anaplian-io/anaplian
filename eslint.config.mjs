import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['**/coverage/', '**/dist/', 'node_modules/', '*.guard.ts'],
  },
  {
    files: ['**/*.{ts}'],
    languageOptions: { globals: globals.browser },
  },
  ...tseslint.configs.recommended,
];
