// auto-generated 2025-05-08T21:18:26.664Z
/* eslint-disable */
import type { VovkClientFetcher } from 'vovk';
import type { fetcher } from 'vovk';
import type { createRPC } from 'vovk';

import type { Controllers as Controllers1 } from '../../src/app/api/foo/client/[[...client]]/route.ts';

import type { Controllers as Controllers2 } from '../../src/app/api/generated/[[...vovk]]/route.ts';

type Options = typeof fetcher extends VovkClientFetcher<infer U> ? U : never;

export const CommonControllerRPC: ReturnType<typeof createRPC<Controllers1['CommonControllerRPC'], Options>>;

export const StreamingControllerRPC: ReturnType<typeof createRPC<Controllers1['StreamingControllerRPC'], Options>>;

export const StreamingGeneratorControllerRPC: ReturnType<
  typeof createRPC<Controllers1['StreamingGeneratorControllerRPC'], Options>
>;

export const CustomSchemaControllerRPC: ReturnType<
  typeof createRPC<Controllers1['CustomSchemaControllerRPC'], Options>
>;

export const WithZodClientControllerRPC: ReturnType<
  typeof createRPC<Controllers1['WithZodClientControllerRPC'], Options>
>;

export const WithYupClientControllerRPC: ReturnType<
  typeof createRPC<Controllers1['WithYupClientControllerRPC'], Options>
>;

export const WithDtoClientControllerRPC: ReturnType<
  typeof createRPC<Controllers1['WithDtoClientControllerRPC'], Options>
>;

export const OpenApiControllerRPC: ReturnType<typeof createRPC<Controllers1['OpenApiControllerRPC'], Options>>;

export const NoValidationControllerOnlyEntityRPC: ReturnType<
  typeof createRPC<Controllers2['NoValidationControllerOnlyEntityRPC'], Options>
>;

export const NoValidationControllerAndServiceEntityRPC: ReturnType<
  typeof createRPC<Controllers2['NoValidationControllerAndServiceEntityRPC'], Options>
>;

export const ZodControllerOnlyEntityRPC: ReturnType<
  typeof createRPC<Controllers2['ZodControllerOnlyEntityRPC'], Options>
>;

export const ZodControllerAndServiceEntityRPC: ReturnType<
  typeof createRPC<Controllers2['ZodControllerAndServiceEntityRPC'], Options>
>;

export const YupControllerOnlyEntityRPC: ReturnType<
  typeof createRPC<Controllers2['YupControllerOnlyEntityRPC'], Options>
>;

export const YupControllerAndServiceEntityRPC: ReturnType<
  typeof createRPC<Controllers2['YupControllerAndServiceEntityRPC'], Options>
>;

export const DtoControllerOnlyEntityRPC: ReturnType<
  typeof createRPC<Controllers2['DtoControllerOnlyEntityRPC'], Options>
>;

export const DtoControllerAndServiceEntityRPC: ReturnType<
  typeof createRPC<Controllers2['DtoControllerAndServiceEntityRPC'], Options>
>;

export { fullSchema } from './fullSchema.cjs';
