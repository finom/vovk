import z, { type ZodType } from 'zod';
import {
  withValidation,
  HttpException,
  HttpStatus,
  type VovkRequest,
  type KnownAny,
  type VovkValidationType,
} from 'vovk';

function withZod<
  T extends (req: REQ, params: ZOD_PARAMS extends ZodType ? z.infer<ZOD_PARAMS> : Record<string, string>) => KnownAny,
  ZOD_BODY extends ZodType<KnownAny> | undefined = undefined,
  ZOD_QUERY extends ZodType<KnownAny> | undefined = undefined,
  ZOD_OUTPUT extends ZodType<KnownAny> | undefined = undefined,
  ZOD_PARAMS extends ZodType<KnownAny> | undefined = undefined,
  ZOD_ITERATION extends ZodType<KnownAny> | undefined = undefined,
  REQ extends VovkRequest<KnownAny, KnownAny, KnownAny> = VovkRequest<
    ZOD_BODY extends ZodType ? z.infer<ZOD_BODY> : undefined,
    ZOD_QUERY extends ZodType ? z.infer<ZOD_QUERY> : undefined,
    ZOD_PARAMS extends ZodType ? z.infer<ZOD_PARAMS> : undefined
  >,
>({
  body,
  query,
  params,
  output,
  iteration,
  handle,
  disableServerSideValidation,
  skipSchemaEmission,
  validateEachIteration,
}: {
  body?: ZOD_BODY;
  query?: ZOD_QUERY;
  params?: ZOD_PARAMS;
  output?: ZOD_OUTPUT;
  iteration?: ZOD_ITERATION;
  handle: T;
  disableServerSideValidation?: boolean | VovkValidationType[];
  skipSchemaEmission?: boolean | VovkValidationType[];
  validateEachIteration?: boolean;
}) {
  return withValidation({
    body,
    query,
    params,
    output,
    iteration,
    disableServerSideValidation,
    skipSchemaEmission,
    validateEachIteration,
    handle: handle as T & {
      __output: ZOD_OUTPUT extends ZodType ? z.infer<ZOD_OUTPUT> : KnownAny;
      __iteration: ZOD_ITERATION extends ZodType ? z.infer<ZOD_ITERATION> : KnownAny;
    },
    getJSONSchemaFromModel: (model) => z.toJSONSchema(model),
    validate: async (data, model, { type, req, i }) => {
      try {
        model.parse(data);
      } catch (e) {
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          `Zod validation failed. Invalid ${type === 'iteration' ? `${type} #${i}` : type} on server for ${req.url}. ${(e as Error).message}`,
          { [type]: data, error: e }
        );
      }
    },
  });
}

withZod.formData = null as unknown as z.ZodType<FormData>;

export { withZod };
