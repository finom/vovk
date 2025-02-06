import path from 'node:path';
import { fileURLToPath } from 'node:url';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-plugin-prettier/recommended';
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
  'packages/**/*.d.mts',
  'packages/**/*.js',
  'packages/**/*.d.ts',
  'packages/**/*.cjs',
  'packages/**/*.d.cts',
  'packages/vovk-react-query/index.cts',
  'test/.vovk-client/',
  'packages/**/eslint.config.js',
  '**/emscripten_fetch_worker.js',
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
