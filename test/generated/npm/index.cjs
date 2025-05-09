// auto-generated 2025-05-08T21:18:26.662Z
/* eslint-disable */
const { fetcher } = require('vovk');
const { createRPC } = require('vovk');
const { fullSchema } = require('./fullSchema.cjs');
const { validateOnClient = null } = require('../../../packages/vovk-ajv/index.js');

exports.CommonControllerRPC = createRPC(fullSchema, 'foo/client', 'CommonControllerRPC', {
  fetcher,
  validateOnClient,
  defaultOptions: { apiRoot: 'http://localhost:3000/api' },
});

exports.StreamingControllerRPC = createRPC(fullSchema, 'foo/client', 'StreamingControllerRPC', {
  fetcher,
  validateOnClient,
  defaultOptions: { apiRoot: 'http://localhost:3000/api' },
});

exports.StreamingGeneratorControllerRPC = createRPC(fullSchema, 'foo/client', 'StreamingGeneratorControllerRPC', {
  fetcher,
  validateOnClient,
  defaultOptions: { apiRoot: 'http://localhost:3000/api' },
});

exports.CustomSchemaControllerRPC = createRPC(fullSchema, 'foo/client', 'CustomSchemaControllerRPC', {
  fetcher,
  validateOnClient,
  defaultOptions: { apiRoot: 'http://localhost:3000/api' },
});

exports.WithZodClientControllerRPC = createRPC(fullSchema, 'foo/client', 'WithZodClientControllerRPC', {
  fetcher,
  validateOnClient,
  defaultOptions: { apiRoot: 'http://localhost:3000/api' },
});

exports.WithYupClientControllerRPC = createRPC(fullSchema, 'foo/client', 'WithYupClientControllerRPC', {
  fetcher,
  validateOnClient,
  defaultOptions: { apiRoot: 'http://localhost:3000/api' },
});

exports.WithDtoClientControllerRPC = createRPC(fullSchema, 'foo/client', 'WithDtoClientControllerRPC', {
  fetcher,
  validateOnClient,
  defaultOptions: { apiRoot: 'http://localhost:3000/api' },
});

exports.OpenApiControllerRPC = createRPC(fullSchema, 'foo/client', 'OpenApiControllerRPC', {
  fetcher,
  validateOnClient,
  defaultOptions: { apiRoot: 'http://localhost:3000/api' },
});

exports.NoValidationControllerOnlyEntityRPC = createRPC(
  fullSchema,
  'generated',
  'NoValidationControllerOnlyEntityRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot: 'http://localhost:3000/api' } }
);

exports.NoValidationControllerAndServiceEntityRPC = createRPC(
  fullSchema,
  'generated',
  'NoValidationControllerAndServiceEntityRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot: 'http://localhost:3000/api' } }
);

exports.ZodControllerOnlyEntityRPC = createRPC(fullSchema, 'generated', 'ZodControllerOnlyEntityRPC', {
  fetcher,
  validateOnClient,
  defaultOptions: { apiRoot: 'http://localhost:3000/api' },
});

exports.ZodControllerAndServiceEntityRPC = createRPC(fullSchema, 'generated', 'ZodControllerAndServiceEntityRPC', {
  fetcher,
  validateOnClient,
  defaultOptions: { apiRoot: 'http://localhost:3000/api' },
});

exports.YupControllerOnlyEntityRPC = createRPC(fullSchema, 'generated', 'YupControllerOnlyEntityRPC', {
  fetcher,
  validateOnClient,
  defaultOptions: { apiRoot: 'http://localhost:3000/api' },
});

exports.YupControllerAndServiceEntityRPC = createRPC(fullSchema, 'generated', 'YupControllerAndServiceEntityRPC', {
  fetcher,
  validateOnClient,
  defaultOptions: { apiRoot: 'http://localhost:3000/api' },
});

exports.DtoControllerOnlyEntityRPC = createRPC(fullSchema, 'generated', 'DtoControllerOnlyEntityRPC', {
  fetcher,
  validateOnClient,
  defaultOptions: { apiRoot: 'http://localhost:3000/api' },
});

exports.DtoControllerAndServiceEntityRPC = createRPC(fullSchema, 'generated', 'DtoControllerAndServiceEntityRPC', {
  fetcher,
  validateOnClient,
  defaultOptions: { apiRoot: 'http://localhost:3000/api' },
});

exports.fullSchema = fullSchema;
