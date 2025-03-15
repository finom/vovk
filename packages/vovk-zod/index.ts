import z, { type ZodSchema } from 'zod';
import { withValidation, HttpException, HttpStatus, type VovkRequest, type KnownAny, VovkValidationType } from 'vovk';
import zodToJsonSchema from 'zod-to-json-schema';

const getErrorText = (e: unknown) =>
  (e as z.ZodError).errors?.map((er) => `${er.message} (${er.path.join('/')})`).join(', ') ?? String(e);

type VovkRequestZod<ZOD_BODY, ZOD_QUERY, ZOD_PARAMS> = VovkRequest<
  ZOD_BODY extends ZodSchema ? z.infer<ZOD_BODY> : undefined,
  ZOD_QUERY extends ZodSchema ? z.infer<ZOD_QUERY> : undefined,
  ZOD_PARAMS extends ZodSchema ? z.infer<ZOD_PARAMS> : undefined
>;

function withZod<
  T extends (req: REQ, params: ZOD_PARAMS extends ZodSchema ? z.infer<ZOD_PARAMS> : Record<string, string>) => KnownAny,
  ZOD_BODY extends ZodSchema<KnownAny> | undefined = undefined,
  ZOD_QUERY extends ZodSchema<KnownAny> | undefined = undefined,
  ZOD_OUTPUT extends ZodSchema<KnownAny> | undefined = undefined,
  ZOD_PARAMS extends ZodSchema<KnownAny> | undefined = undefined,
  ZOD_ITERATION extends ZodSchema<KnownAny> | undefined = undefined,
  REQ extends VovkRequestZod<ZOD_BODY, ZOD_QUERY, ZOD_PARAMS> = VovkRequestZod<ZOD_BODY, ZOD_QUERY, ZOD_PARAMS>,
>({
  body,
  query,
  params,
  output,
  iteration,
  handle,
  disableServerSideValidation,
  skipSchemaEmission,
  validateEveryIteration,
}: {
  body?: ZOD_BODY;
  query?: ZOD_QUERY;
  params?: ZOD_PARAMS;
  output?: ZOD_OUTPUT;
  iteration?: ZOD_ITERATION;
  handle: T;
  disableServerSideValidation?: boolean | VovkValidationType[];
  skipSchemaEmission?: boolean | VovkValidationType[];
  validateEveryIteration?: boolean;
}) {
  return withValidation({
    body,
    query,
    params,
    output,
    iteration,
    disableServerSideValidation,
    skipSchemaEmission,
    validateEveryIteration,
    handle: handle as T & {
      __output: ZOD_OUTPUT extends ZodSchema ? z.infer<ZOD_OUTPUT> : KnownAny;
      __iteration: ZOD_ITERATION extends ZodSchema ? z.infer<ZOD_ITERATION> : KnownAny;
    },
    getHandlerSchema: ({ skipSchemaEmissionKeys }) => {
      const getSchema = (key: VovkValidationType, model?: ZodSchema<KnownAny>) =>
        !skipSchemaEmissionKeys.includes(key) && model ? zodToJsonSchema(model, { errorMessages: true }) : null;

      return {
        validation: {
          body: getSchema('body', body),
          query: getSchema('query', query),
          output: getSchema('output', output),
          params: getSchema('params', params),
          iteration: getSchema('iteration', iteration),
        },
      };
    },
    validate: async (data, model, { type, req, i }) => {
      try {
        model.parse(data);
      } catch (e) {
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          `Zod validation failed. Invalid ${type === 'iteration' ? `${type} #${i}` : type} on server for ${req.url}. ${getErrorText(e)}`,
          { [type]: data }
        );
      }
    },
  });
}

withZod.formData = null as unknown as z.ZodType<FormData>;

export { withZod };
