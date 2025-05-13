// auto-generated 2025-05-13T08:57:21.085Z
/* eslint-disable */
import type { VovkClientFetcher } from 'vovk';
import { fetcher } from 'vovk';
import { createRPC } from 'vovk';
import { fullSchema } from './fullSchema.ts';

import type { Controllers as Controllers0 } from "../src/app/api/foo/client/[[...client]]/route.ts";

import type { Controllers as Controllers1 } from "../src/app/api/generated/[[...vovk]]/route.ts";


import { validateOnClient } from '../../packages/vovk-ajv/index.js';

type Options = typeof fetcher extends VovkClientFetcher<infer U> ? U : never;

  
export const CommonControllerRPC = createRPC<Controllers0["CommonControllerRPC"], Options>(
  fullSchema, 'foo/client', 'CommonControllerRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot: 'http://localhost:3000/api' } }
);
  
export const StreamingControllerRPC = createRPC<Controllers0["StreamingControllerRPC"], Options>(
  fullSchema, 'foo/client', 'StreamingControllerRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot: 'http://localhost:3000/api' } }
);
  
export const StreamingGeneratorControllerRPC = createRPC<Controllers0["StreamingGeneratorControllerRPC"], Options>(
  fullSchema, 'foo/client', 'StreamingGeneratorControllerRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot: 'http://localhost:3000/api' } }
);
  
export const CustomSchemaControllerRPC = createRPC<Controllers0["CustomSchemaControllerRPC"], Options>(
  fullSchema, 'foo/client', 'CustomSchemaControllerRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot: 'http://localhost:3000/api' } }
);
  
export const WithZodClientControllerRPC = createRPC<Controllers0["WithZodClientControllerRPC"], Options>(
  fullSchema, 'foo/client', 'WithZodClientControllerRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot: 'http://localhost:3000/api' } }
);
  
export const WithYupClientControllerRPC = createRPC<Controllers0["WithYupClientControllerRPC"], Options>(
  fullSchema, 'foo/client', 'WithYupClientControllerRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot: 'http://localhost:3000/api' } }
);
  
export const WithDtoClientControllerRPC = createRPC<Controllers0["WithDtoClientControllerRPC"], Options>(
  fullSchema, 'foo/client', 'WithDtoClientControllerRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot: 'http://localhost:3000/api' } }
);
  
export const OpenApiControllerRPC = createRPC<Controllers0["OpenApiControllerRPC"], Options>(
  fullSchema, 'foo/client', 'OpenApiControllerRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot: 'http://localhost:3000/api' } }
);
  

  
export const NoValidationControllerOnlyEntityRPC = createRPC<Controllers1["NoValidationControllerOnlyEntityRPC"], Options>(
  fullSchema, 'generated', 'NoValidationControllerOnlyEntityRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot: 'http://localhost:3000/api' } }
);
  
export const NoValidationControllerAndServiceEntityRPC = createRPC<Controllers1["NoValidationControllerAndServiceEntityRPC"], Options>(
  fullSchema, 'generated', 'NoValidationControllerAndServiceEntityRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot: 'http://localhost:3000/api' } }
);
  
export const ZodControllerOnlyEntityRPC = createRPC<Controllers1["ZodControllerOnlyEntityRPC"], Options>(
  fullSchema, 'generated', 'ZodControllerOnlyEntityRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot: 'http://localhost:3000/api' } }
);
  
export const ZodControllerAndServiceEntityRPC = createRPC<Controllers1["ZodControllerAndServiceEntityRPC"], Options>(
  fullSchema, 'generated', 'ZodControllerAndServiceEntityRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot: 'http://localhost:3000/api' } }
);
  
export const YupControllerOnlyEntityRPC = createRPC<Controllers1["YupControllerOnlyEntityRPC"], Options>(
  fullSchema, 'generated', 'YupControllerOnlyEntityRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot: 'http://localhost:3000/api' } }
);
  
export const YupControllerAndServiceEntityRPC = createRPC<Controllers1["YupControllerAndServiceEntityRPC"], Options>(
  fullSchema, 'generated', 'YupControllerAndServiceEntityRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot: 'http://localhost:3000/api' } }
);
  
export const DtoControllerOnlyEntityRPC = createRPC<Controllers1["DtoControllerOnlyEntityRPC"], Options>(
  fullSchema, 'generated', 'DtoControllerOnlyEntityRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot: 'http://localhost:3000/api' } }
);
  
export const DtoControllerAndServiceEntityRPC = createRPC<Controllers1["DtoControllerAndServiceEntityRPC"], Options>(
  fullSchema, 'generated', 'DtoControllerAndServiceEntityRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot: 'http://localhost:3000/api' } }
);
  

export { fullSchema };