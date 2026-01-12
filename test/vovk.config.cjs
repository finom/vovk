// @ts-check
/** @type {import('vovk').VovkConfig} */
const vovkConfig = {
  modulesDir: './src/modules',
  segmentedClient: {
    enabled: true,
    outDir: './other-compiled-test-sources/segmented-client',
  },
  schemaOutDir: './.vovk-schema',
  rootEntry: 'api',
  logLevel: 'debug',
  moduleTemplates: {
    service: 'none',
    controller: 'none',
  },
  outputConfig: {
    origin: `http://localhost:${process.env.PORT}`,
    imports: {
      validateOnClient: '../packages/vovk-ajv/index.js',
    },
    openAPIObject: {
      info: {
        title: 'Hello, OpenAPI!',
        description: 'Vovk test app',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:3000',
        },
      ],
    },
    segments: {
      client2: {
        imports: {
          fetcher: './src/lib/fetcher.ts',
        },
      },
    },
  },
  bundle: {
    build: async ({ entry, outDir }) => {
      const { build } = await import('tsdown');
      console.log('Building bundle to', outDir);
      await build({
        entry,
        dts: true,
        format: ['cjs', 'esm'],
        hash: false,
        fixedExtension: true,
        clean: true,
        outDir,
      });
    },
    outDir: './other-compiled-test-sources/bundle',
  },
  clientTemplateDefs: {
    py: {
      extends: 'py',
      composedClient: {
        outDir: './tmp/py',
      },
      outputConfig: {
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
      },
      outputConfig: {
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
