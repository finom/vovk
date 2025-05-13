// auto-generated 2025-05-13T10:30:00.011Z
/* eslint-disable */
import type { VovkClientFetcher } from 'vovk';
import { fetcher } from 'vovk';
import { createRPC } from 'vovk';
import { fullSchema } from './fullSchema.ts';

import type { Controllers as Controllers0 } from "../../../../src/app/api/foo/client/[[...client]]/route.ts";


import { validateOnClient } from '../../../../../packages/vovk-ajv/index.js';

type Options = typeof fetcher extends VovkClientFetcher<infer U> ? U : never;

  
export const CommonControllerRPC = createRPC<Controllers0["CommonControllerRPC"], Options>(
  fullSchema, 'foo/client', 'CommonControllerRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot: 'http://localhost:3210/api' } }
);
  
export const StreamingControllerRPC = createRPC<Controllers0["StreamingControllerRPC"], Options>(
  fullSchema, 'foo/client', 'StreamingControllerRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot: 'http://localhost:3210/api' } }
);
  
export const StreamingGeneratorControllerRPC = createRPC<Controllers0["StreamingGeneratorControllerRPC"], Options>(
  fullSchema, 'foo/client', 'StreamingGeneratorControllerRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot: 'http://localhost:3210/api' } }
);
  
export const CustomSchemaControllerRPC = createRPC<Controllers0["CustomSchemaControllerRPC"], Options>(
  fullSchema, 'foo/client', 'CustomSchemaControllerRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot: 'http://localhost:3210/api' } }
);
  
export const WithZodClientControllerRPC = createRPC<Controllers0["WithZodClientControllerRPC"], Options>(
  fullSchema, 'foo/client', 'WithZodClientControllerRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot: 'http://localhost:3210/api' } }
);
  
export const WithYupClientControllerRPC = createRPC<Controllers0["WithYupClientControllerRPC"], Options>(
  fullSchema, 'foo/client', 'WithYupClientControllerRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot: 'http://localhost:3210/api' } }
);
  
export const WithDtoClientControllerRPC = createRPC<Controllers0["WithDtoClientControllerRPC"], Options>(
  fullSchema, 'foo/client', 'WithDtoClientControllerRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot: 'http://localhost:3210/api' } }
);
  
export const OpenApiControllerRPC = createRPC<Controllers0["OpenApiControllerRPC"], Options>(
  fullSchema, 'foo/client', 'OpenApiControllerRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot: 'http://localhost:3210/api' } }
);
  

export { fullSchema };