// @ts-check
/** @type {import('vovk').VovkConfig} */
const config = {
  composedClient: {
    fromTemplates: ['ts'],
    outDir: './src/client', // makes the client available for the bundle re-exports, so the bundle package doesn't import "vovk-client"
    prettifyClient: true,
  },
  outputConfig: {
    imports: {
      validateOnClient: 'vovk-ajv',
    },
  },
  bundle: {
    keepPrebundleDir: true,
    // make re-exported components use modules with proper origin
    prebundleOutDir: './src/client',
    build: async ({ entry, outDir }) => {
      const { build } = await import('tsdown');
      await build({
        entry,
        dts: true,
        format: 'esm',
        hash: false,
        fixedExtension: true,
        clean: true,
        outDir,
        platform: 'neutral',
        outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
        outputOptions: {
          inlineDynamicImports: true,
        },
        inputOptions: {
          resolve: {
            mainFields: ['module', 'main'],
          },
        },
        // noExternal: ['!next/**'],
      });
    },
    outputConfig: {
      origin: 'https://examples.vovk.dev',
      reExports: {
        'default as ProgressiveExample': './src/app/progressive/progressive-example.tsx',
        'default as JSONLinesExample': './src/app/jsonlines/json-lines-example.tsx',
        'default as JSONLinesResponseExample': './src/app/jsonlines-responder/json-lines-responder-example.tsx',
        'default as PollExample': './src/app/polling/poll-example.tsx',
        'getGithubFile, default as getGithubFiles': '@/lib/get-github-files.ts',
      },
      readme: {
        banner: `<p align="center">
  <a href="https://vovk.dev">
    <picture>
      <source width="300" media="(prefers-color-scheme: dark)" srcset="https://vovk.dev/vovk-logo-white.svg">
      <source width="300" media="(prefers-color-scheme: light)" srcset="https://vovk.dev/vovk-logo.svg">
      <img width="300" alt="vovk" src="https://vovk.dev/vovk-logo.svg">
    </picture>
  </a>
  <br />
  <strong>Back-end Framework for Next.js App Router</strong>
  <br />
  <em>One codebase → type-safe clients, OpenAPI, and AI tools</em>
  <br />
  <a href="https://vovk.dev/">Documentation</a>
  &nbsp;&nbsp;
  <a href="https://vovk.dev/quick-install">Quick Start</a>
  &nbsp;&nbsp;
  <a href="https://vovk.dev/performance">Performance</a>
</p>`,
      },
      package: {
        dependencies: {
          'react-loading-skeleton': '^3.5.0',
        },
      },
    },
  },
  logLevel: 'debug',
};

export default config;
