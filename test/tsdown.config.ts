import { defineConfig } from 'tsdown';

export default [
  defineConfig({
    entry: 'tmp/ts/index.ts',
    dts: true,
    format: ['cjs', 'esm'],
    fixedExtension: true,
  }),
];
