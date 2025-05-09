// auto-generated 2025-05-08T21:18:26.663Z
/* eslint-disable */
import { fetcher } from 'vovk';
import { createRPC } from 'vovk';
import { fullSchema } from './fullSchema.cjs';

import { validateOnClient } from '../../../packages/vovk-ajv/index.js';

export const CommonControllerRPC = createRPC(fullSchema, 'foo/client', 'CommonControllerRPC', {
  fetcher,
  validateOnClient,
  defaultOptions: { apiRoot: 'http://localhost:3000/api' },
});

export const StreamingControllerRPC = createRPC(fullSchema, 'foo/client', 'StreamingControllerRPC', {
  fetcher,
  validateOnClient,
  defaultOptions: { apiRoot: 'http://localhost:3000/api' },
});

export const StreamingGeneratorControllerRPC = createRPC(fullSchema, 'foo/client', 'StreamingGeneratorControllerRPC', {
  fetcher,
  validateOnClient,
  defaultOptions: { apiRoot: 'http://localhost:3000/api' },
});

export const CustomSchemaControllerRPC = createRPC(fullSchema, 'foo/client', 'CustomSchemaControllerRPC', {
  fetcher,
  validateOnClient,
  defaultOptions: { apiRoot: 'http://localhost:3000/api' },
});

export const WithZodClientControllerRPC = createRPC(fullSchema, 'foo/client', 'WithZodClientControllerRPC', {
  fetcher,
  validateOnClient,
  defaultOptions: { apiRoot: 'http://localhost:3000/api' },
});

export const WithYupClientControllerRPC = createRPC(fullSchema, 'foo/client', 'WithYupClientControllerRPC', {
  fetcher,
  validateOnClient,
  defaultOptions: { apiRoot: 'http://localhost:3000/api' },
});

export const WithDtoClientControllerRPC = createRPC(fullSchema, 'foo/client', 'WithDtoClientControllerRPC', {
  fetcher,
  validateOnClient,
  defaultOptions: { apiRoot: 'http://localhost:3000/api' },
});

export const OpenApiControllerRPC = createRPC(fullSchema, 'foo/client', 'OpenApiControllerRPC', {
  fetcher,
  validateOnClient,
  defaultOptions: { apiRoot: 'http://localhost:3000/api' },
});

export const NoValidationControllerOnlyEntityRPC = createRPC(
  fullSchema,
  'generated',
  'NoValidationControllerOnlyEntityRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot: 'http://localhost:3000/api' } }
);

export const NoValidationControllerAndServiceEntityRPC = createRPC(
  fullSchema,
  'generated',
  'NoValidationControllerAndServiceEntityRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot: 'http://localhost:3000/api' } }
);

export const ZodControllerOnlyEntityRPC = createRPC(fullSchema, 'generated', 'ZodControllerOnlyEntityRPC', {
  fetcher,
  validateOnClient,
  defaultOptions: { apiRoot: 'http://localhost:3000/api' },
});

export const ZodControllerAndServiceEntityRPC = createRPC(fullSchema, 'generated', 'ZodControllerAndServiceEntityRPC', {
  fetcher,
  validateOnClient,
  defaultOptions: { apiRoot: 'http://localhost:3000/api' },
});

export const YupControllerOnlyEntityRPC = createRPC(fullSchema, 'generated', 'YupControllerOnlyEntityRPC', {
  fetcher,
  validateOnClient,
  defaultOptions: { apiRoot: 'http://localhost:3000/api' },
});

export const YupControllerAndServiceEntityRPC = createRPC(fullSchema, 'generated', 'YupControllerAndServiceEntityRPC', {
  fetcher,
  validateOnClient,
  defaultOptions: { apiRoot: 'http://localhost:3000/api' },
});

export const DtoControllerOnlyEntityRPC = createRPC(fullSchema, 'generated', 'DtoControllerOnlyEntityRPC', {
  fetcher,
  validateOnClient,
  defaultOptions: { apiRoot: 'http://localhost:3000/api' },
});

export const DtoControllerAndServiceEntityRPC = createRPC(fullSchema, 'generated', 'DtoControllerAndServiceEntityRPC', {
  fetcher,
  validateOnClient,
  defaultOptions: { apiRoot: 'http://localhost:3000/api' },
});

export { fullSchema };
