// @ts-check
/** @type {import('vovk').VovkConfig} */
const vovkConfig = {
  logLevel: 'debug',
  origin: `http://localhost:${process.env.PORT}`,
  clientTemplateDefs: {
    rs: {
      extends: 'rs',
      composedClient: {
        outDir: '../packages/vovk-rust/generated_rust_client',
        package: {
          name: 'generated_rust_client',
          version: '0.1.0',
          license: 'MIT',
          description: 'Vovk Rust Client',
        },
      },
    },
  },
  composedClient: {
    fromTemplates: ['rs'],
  },
};

export default vovkConfig;
