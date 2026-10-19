import Nextra from 'nextra';
import { codeThemes } from './src/theme/code-theme.mjs';

const withNextra = Nextra({
  search: {
    codeblocks: false,
  },
  mdxOptions: {
    rehypePrettyCodeOptions: { theme: codeThemes },
  },
});

// Nextra aliases the MDX import source to a Turbopack builtin, which doesn't find src/mdx-components.tsx.
const nextra = withNextra({
  turbopack: {
    resolveAlias: { 'next-mdx-import-source-file': './src/mdx-components.tsx' },
  },
});

/** @type {import('next').NextConfig} */
const config = {
  ...nextra,
  output: 'export',
  images: { unoptimized: true },
  typedRoutes: true,
};

// output: 'export' does not work with rewrites
delete config.rewrites;

export default config;
