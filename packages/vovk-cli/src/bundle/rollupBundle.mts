import path from 'node:path';
import { rollup, type OutputOptions, type RollupOptions } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';

function getRollupConfig({
  tsFullClientOutDirInput,
  outDir,
  cwd,
}: {
  tsFullClientOutDirInput: string;
  outDir: string;
  cwd: string;
}) {
  const out = path.join(cwd, outDir);
  const config: RollupOptions = {
    input: path.join(tsFullClientOutDirInput, './index.ts'),
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
        rootDir: tsFullClientOutDirInput,
        module: 'ESNext',
        target: 'ESNext',
      }),
    ],
  };
  return config;
}

export async function rollupBundle({
  tsFullClientOutDirInput,
  outDir,
}: {
  tsFullClientOutDirInput: string;
  outDir: string;
}) {
  const cwd = process.cwd();
  const { output, ...input } = getRollupConfig({
    tsFullClientOutDirInput,
    outDir,
    cwd,
  });

  const bundle = await rollup(input);

  // Write the bundle to disk
  for (const outputOption of output as OutputOptions[]) {
    await bundle.write(outputOption);
  }

  await bundle.close();
}
