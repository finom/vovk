import { z, type ZodType } from 'zod/v4';
import {
  withValidation,
  HttpException,
  HttpStatus,
  type VovkRequest,
  type KnownAny,
  type VovkValidationType,
  type VovkTypedMethod,
} from 'vovk';

const getErrorText = (e: unknown) => {
  if (e instanceof z.ZodError) {
    return e.issues
      .map((issue) => {
        const path = issue.path.length ? `${issue.path.join('.')}` : '';
        const message = issue.message;

        return `"${path}": "${message}"`;
      })
      .join('; ');
  }

  if (e instanceof Error) {
    return e.message;
  }
};

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
  options,
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
  options?: {
    toJSONSchemaParams?: Parameters<typeof z.toJSONSchema>[1];
  };
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
    handle: handle as VovkTypedMethod<
      T,
      ZOD_BODY extends ZodType ? z.infer<ZOD_BODY> : KnownAny,
      ZOD_QUERY extends ZodType ? z.infer<ZOD_QUERY> : KnownAny,
      ZOD_PARAMS extends ZodType ? z.infer<ZOD_PARAMS> : Record<string, string>,
      ZOD_OUTPUT extends ZodType ? z.infer<ZOD_OUTPUT> : KnownAny,
      ZOD_ITERATION extends ZodType ? z.infer<ZOD_ITERATION> : KnownAny
    >,
    getJSONSchemaFromModel: (model) => z.toJSONSchema(model, options?.toJSONSchemaParams),
    validate: async (data, model, { type, i }) => {
      try {
        model.parse(data);
      } catch (e) {
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          `Zod validation failed. Invalid ${type === 'iteration' ? `${type} #${i}` : type} on server: ${getErrorText(e)}`,
          { [type]: data, error: e }
        );
      }
    },
  });
}

withZod.formData = null as unknown as z.ZodType<FormData>;

export { withZod };
