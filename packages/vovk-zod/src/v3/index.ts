import { z, type ZodSchema } from 'zod/v3';
import {
  withValidationLibrary,
  HttpException,
  HttpStatus,
  type VovkRequest,
  type KnownAny,
  type VovkValidationType,
  type VovkTypedMethod,
} from 'vovk';
import { zodToJsonSchema } from 'zod-to-json-schema';

const getErrorText = (e: unknown) =>
  (e as z.ZodError).errors?.map((er) => `${er.message} (${er.path.join('/')})`).join(', ') ?? String(e);

function withZod<
  T extends (req: REQ, params: ZOD_PARAMS extends ZodSchema ? z.infer<ZOD_PARAMS> : Record<string, string>) => KnownAny,
  ZOD_BODY extends ZodSchema<KnownAny> | undefined = undefined,
  ZOD_QUERY extends ZodSchema<KnownAny> | undefined = undefined,
  ZOD_OUTPUT extends ZodSchema<KnownAny> | undefined = undefined,
  ZOD_PARAMS extends ZodSchema<KnownAny> | undefined = undefined,
  ZOD_ITERATION extends ZodSchema<KnownAny> | undefined = undefined,
  REQ extends VovkRequest<KnownAny, KnownAny, KnownAny> = VovkRequest<
    ZOD_BODY extends ZodSchema ? z.infer<ZOD_BODY> : undefined,
    ZOD_QUERY extends ZodSchema ? z.infer<ZOD_QUERY> : undefined,
    ZOD_PARAMS extends ZodSchema ? z.infer<ZOD_PARAMS> : undefined
  >,
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
}: {
  isForm?: IS_FORM;
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
  return withValidationLibrary({
    isForm,
    body,
    query,
    params,
    output,
    iteration,
    disableServerSideValidation,
    skipSchemaEmission,
    validateEachIteration,
    handle: handle as VovkTypedMethod<
      T,
      ZOD_BODY extends ZodSchema ? z.infer<ZOD_BODY> : KnownAny,
      ZOD_QUERY extends ZodSchema ? z.infer<ZOD_QUERY> : KnownAny,
      ZOD_PARAMS extends ZodSchema ? z.infer<ZOD_PARAMS> : Record<string, string>,
      ZOD_OUTPUT extends ZodSchema ? z.infer<ZOD_OUTPUT> : KnownAny,
      ZOD_ITERATION extends ZodSchema ? z.infer<ZOD_ITERATION> : KnownAny,
      IS_FORM extends true ? true : KnownAny
    >,
    toJSONSchema: (model) => zodToJsonSchema(model, { errorMessages: true }),
    validate: async (data, model, { type, req, i }) => {
      try {
        model.parse(data);
      } catch (e) {
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          `Validation failed. Invalid ${type === 'iteration' ? `${type} #${i}` : type} on server for ${req.url}. ${getErrorText(e)}`,
          { [type]: data }
        );
      }
    },
  });
}

export { withZod };
