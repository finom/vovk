import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';

// @ts-check
/** @type {import('rollup').RollupOptions} */
const config = {
  input: './tmp/ts/index.ts',
  output: [
    {
      file: './dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: './dist/module.mjs',
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    resolve(),
    commonjs(),
    json(),
    typescript({
      declaration: true,
      declarationDir: './dist',
      outDir: './',
      rootDir: './tmp/ts',
      module: 'ESNext',
      target: 'ESNext',
      allowImportingTsExtensions: true,
      emitDeclarationOnly: true,
    }),
  ],
};

export default config;
