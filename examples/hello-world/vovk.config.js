// @ts-check

const PROD_ORIGIN = 'https://hello-world.vovk.dev';
// Commented lines indicate default values
/** @type {import('vovk').VovkConfig} */
const config = {
  logLevel: 'debug',
  outputConfig: {
    imports: {
      validateOnClient: 'vovk-ajv',
    },
    openAPIObject: {
      info: {
        title: '"Hello World" app API',
        description:
          'API for "Hello World" app hosted at https://hello-world.vovk.dev/. Source code is available on Github https://github.com/finom/vovk/tree/main/examples/hello-world. For more information about this app, visit the documentation page https://vovk.dev/hello-world.',
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT',
        },
        version: '1.0.0',
      },
      servers: [
        {
          url: 'https://hello-world.vovk.dev',
          description: 'Production',
        },
        {
          url: 'http://localhost:3000',
          description: 'Localhost',
        },
      ],
    },
  },
  composedClient: {
    fromTemplates: ['ts', 'py', 'rs'],
    // enabled: true,
    // outDir: "./src/client",
    outputConfig: {
      origin:
        process.env.NODE_ENV === 'production'
          ? null
          : `http://localhost:${process.env.PORT ?? 3000}`,
    },
    // prettifyClient: true,
  },
  segmentedClient: {
    // fromTemplates: ["ts"],
    enabled: true,
    // outDir: "./src/client",
    // outputConfig: { origin: '' },
    // prettifyClient: true,
  },
  bundle: {
    outputConfig: {
      origin: PROD_ORIGIN,
      imports: { validateOnClient: null },
      package: {
        type: 'module',
        main: './index.js',
        types: './index.d.ts',
        exports: {
          '.': {
            default: './index.js',
            types: './index.d.ts',
          },
        },
      },
    },
    keepPrebundleDir: true,
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
        noExternal: ['!next/**'],
      });
    },
  },
  clientTemplateDefs: {
    py: {
      extends: 'py',
      outputConfig: { origin: PROD_ORIGIN },
      // composedClient: { outDir: "./dist_python" },
    },
    rs: {
      extends: 'rs',
      outputConfig: { origin: PROD_ORIGIN },
      // composedClient: { outDir: "./dist_rust" },
    },
  },
};

module.exports = config;
