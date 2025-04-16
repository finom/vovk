// @ts-check
/** @type {import('vovk').VovkConfig} */
const vovkConfig = {
  logLevel: 'debug',
  origin: `http://localhost:${process.env.PORT}`,
  clientTemplateDefs: {
    rust: {
      clientOutDir: '../packages/vovk-rust-client/generated_rust_client',
      templatePath: '../packages/vovk-rust-client/template/',
      fullSchemaJson: './data/full-schema.json',
      package: {
        name: 'generated_rust_client',
        version: '0.1.0',
        license: 'MIT',
        description: 'Vovk Rust Client',
      },
    },
  },
  generateFrom: ['rust'],
};

export default vovkConfig;
