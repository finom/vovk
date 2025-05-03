// auto-generated 2025-05-03T16:12:22.017Z
/* eslint-disable */
import type { VovkClientFetcher } from 'vovk';
import { fetcher } from 'vovk';
import { createRPC } from 'vovk';
import { fullSchema } from './fullSchema.ts';

import type { Controllers as Controllers0 } from "../../app/api/generated/[[...vovk]]/route.ts";


import { validateOnClient } from '../../../../packages/vovk-ajv/index.js';

type Options = typeof fetcher extends VovkClientFetcher<infer U> ? U : never;
const apiRoot = 'http://localhost:3000/api';

  
export const NoValidationControllerOnlyEntityRPC = createRPC<Controllers0["NoValidationControllerOnlyEntityRPC"], Options>(
  fullSchema, 'generated', 'NoValidationControllerOnlyEntityRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot } }
);
  
export const NoValidationControllerAndServiceEntityRPC = createRPC<Controllers0["NoValidationControllerAndServiceEntityRPC"], Options>(
  fullSchema, 'generated', 'NoValidationControllerAndServiceEntityRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot } }
);
  
export const ZodControllerOnlyEntityRPC = createRPC<Controllers0["ZodControllerOnlyEntityRPC"], Options>(
  fullSchema, 'generated', 'ZodControllerOnlyEntityRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot } }
);
  
export const ZodControllerAndServiceEntityRPC = createRPC<Controllers0["ZodControllerAndServiceEntityRPC"], Options>(
  fullSchema, 'generated', 'ZodControllerAndServiceEntityRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot } }
);
  
export const YupControllerOnlyEntityRPC = createRPC<Controllers0["YupControllerOnlyEntityRPC"], Options>(
  fullSchema, 'generated', 'YupControllerOnlyEntityRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot } }
);
  
export const YupControllerAndServiceEntityRPC = createRPC<Controllers0["YupControllerAndServiceEntityRPC"], Options>(
  fullSchema, 'generated', 'YupControllerAndServiceEntityRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot } }
);
  
export const DtoControllerOnlyEntityRPC = createRPC<Controllers0["DtoControllerOnlyEntityRPC"], Options>(
  fullSchema, 'generated', 'DtoControllerOnlyEntityRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot } }
);
  
export const DtoControllerAndServiceEntityRPC = createRPC<Controllers0["DtoControllerAndServiceEntityRPC"], Options>(
  fullSchema, 'generated', 'DtoControllerAndServiceEntityRPC',
  { fetcher, validateOnClient, defaultOptions: { apiRoot } }
);
  

export { fullSchema };