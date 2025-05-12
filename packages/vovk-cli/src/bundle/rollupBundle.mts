import path from 'node:path';
import { rollup, type OutputOptions, type RollupOptions } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';

function getRollupConfig({
  tsFullClientOutAbsoluteDirInput,
  outDir,
  cwd,
}: {
  tsFullClientOutAbsoluteDirInput: string;
  outDir: string;
  cwd: string;
}) {
  const out = path.join(cwd, outDir);
  const config: RollupOptions = {
    input: path.join(tsFullClientOutAbsoluteDirInput, './index.ts'),
    output: [
      {
        file: path.join(out, './index.cjs'),
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: path.join(out, './index.mjs'),
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
        declarationDir: out,
        outDir: cwd,
        rootDir: tsFullClientOutAbsoluteDirInput,
        module: 'ESNext',
        target: 'ESNext',
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        allowImportingTsExtensions: true,
        noForceEmit: false,
      }),
    ],
  };
  return config;
}

export async function rollupBundle({
  tsFullClientOutAbsoluteDirInput,
  outDir,
  cwd,
}: {
  tsFullClientOutAbsoluteDirInput: string;
  outDir: string;
  cwd: string;
}) {
  const { output, ...input } = getRollupConfig({
    tsFullClientOutAbsoluteDirInput,
    outDir,
    cwd,
  });

  console.log({ input });

  const bundle = await rollup(input);

  for (const outputOption of output as OutputOptions[]) {
    await bundle.write(outputOption);
  }

  await bundle.close();
}
