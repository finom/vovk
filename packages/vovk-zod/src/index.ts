import { z } from 'zod/v4';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import { type VovkRequest, type KnownAny, type VovkValidationType, withStandard } from 'vovk';

function withZod<
  T extends (
    req: VovkRequest<
      BODY extends StandardSchemaV1 ? StandardSchemaV1.InferInput<BODY> : undefined,
      QUERY extends StandardSchemaV1 ? StandardSchemaV1.InferInput<QUERY> : undefined,
      PARAMS extends StandardSchemaV1 ? StandardSchemaV1.InferInput<PARAMS> : undefined
    >,
    params: PARAMS extends StandardSchemaV1 ? StandardSchemaV1.InferInput<PARAMS> : Record<string, string>
  ) => KnownAny,
  BODY extends StandardSchemaV1,
  QUERY extends StandardSchemaV1,
  PARAMS extends StandardSchemaV1,
  OUTPUT extends StandardSchemaV1,
  ITERATION extends StandardSchemaV1,
  IS_FORM extends boolean = false,
>({
  isForm,
  body,
  query,
  params,
  output,
  iteration,
  handle,
  disableServerSideValidation,
  skipSchemaEmission,
  validateEachIteration,
  options,
}: {
  isForm?: IS_FORM;
  body?: BODY;
  query?: QUERY;
  params?: PARAMS;
  output?: OUTPUT;
  iteration?: ITERATION;
  handle: T;
  disableServerSideValidation?: boolean | VovkValidationType[];
  skipSchemaEmission?: boolean | VovkValidationType[];
  validateEachIteration?: boolean;
  options?: {
    toJSONSchemaParams?: Parameters<typeof z.toJSONSchema>[1];
  };
}) {
  return withStandard({
    isForm,
    body,
    query,
    params,
    output,
    iteration,
    disableServerSideValidation,
    skipSchemaEmission,
    validateEachIteration,
    handle,
    toJSONSchema: (model) => Object.assign(z.toJSONSchema(model as z.core.$ZodType, options?.toJSONSchemaParams)),
  });
}

export { withZod };
