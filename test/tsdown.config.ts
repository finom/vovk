import { defineConfig } from 'tsdown';

export default [
  defineConfig({
    entry: '.tmp-ts-rpc/index.ts',
    dts: true,
  }),
];
