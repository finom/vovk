import path from 'node:path';
import { fileURLToPath } from 'node:url';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier/recommended';
import globals from 'globals';
import { includeIgnoreFile } from '@eslint/compat';

// @ts-check
const ignores = [
  ...(includeIgnoreFile(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.gitignore')).ignores ?? []),
  '**/.vovk-schema',
  '**/test_data',
  '**/*.d.ts',
  '**/*.d.mts',
  'packages/**/*.mjs',
  'packages/**/*.js',
  'test/.vovk-client/',
  '!packages/**/eslint.config.js'
];

export default tseslint.config(
  {
    name: 'Custom Config',
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'warn',
    },
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  { ignores },
  { files: ['**/*.ts', '**/*.mjs', '**/*.mts', '**/*.js'] }
);
