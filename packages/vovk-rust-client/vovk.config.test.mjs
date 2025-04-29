// @ts-check
/** @type {import('vovk').VovkConfig} */
const vovkConfig = {
  logLevel: 'debug',
  origin: `http://localhost:${process.env.PORT}`,
  clientTemplateDefs: {
    rust: {
      templatePath: '../packages/vovk-rust-client/template/',
      requires: {
        fullSchemaJson: './data',
      },
      fullClient: {
        outDir: '../packages/vovk-rust-client/generated_rust_client',
        package: {
          name: 'generated_rust_client',
          version: '0.1.0',
          license: 'MIT',
          description: 'Vovk Rust Client',
        },
      },
    },
  },
  fullClient: {
    fromTemplates: ['rust'],
  },
};

export default vovkConfig;
