import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* turbopack: {
    root: import.meta.dirname,
    resolveAlias: {
      vovk: path.join(import.meta.dirname, '/../packages/vovk/src/index.ts'),
    },
  }, */
};

export default nextConfig;
