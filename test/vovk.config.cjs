// @ts-check
/** @type {import('vovk').VovkConfig} */
const vovkConfig = {
  modulesDir: './src/modules',
  imports: {
    validateOnClient: '../packages/vovk-ajv/index.js',
  },
  segmentedClient: {
    enabled: true,
    outDir: './other-compiled-test-sources/segmented-client',
  },
  schemaOutDir: './.vovk-schema',
  origin: `http://localhost:${process.env.PORT}`,
  rootEntry: 'api',
  logLevel: 'debug',
  moduleTemplates: {
    service: 'none',
    controller: 'none',
  },
  bundle: {
    tsdownBuildOptions: {
      outDir: './other-compiled-test-sources/bundle',
      tsconfig: './tsconfig.tsdown-bundle.json',
    },
  },
  clientTemplateDefs: {
    py: {
      extends: 'py',
      composedClient: {
        outDir: './tmp/py',
        package: {
          name: 'test_generated_python_client',
          version: '0.0.1',
          license: 'MIT',
          description: 'Vovk.ts Python Client',
        },
      },
    },
    rs: {
      extends: 'rs',
      composedClient: {
        outDir: './tmp/rs',
        package: {
          name: 'test_generated_rust_client',
          version: '0.0.1',
          license: 'MIT',
          description: 'Vovk.ts Rust Client',
        },
      },
    },
  },
};

module.exports = vovkConfig;
