import z, { type ZodSchema } from 'zod';
import { withValidation, HttpException, HttpStatus, type VovkRequest, type KnownAny } from 'vovk';
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
  REQ extends VovkRequestZod<ZOD_BODY, ZOD_QUERY, ZOD_PARAMS> = VovkRequestZod<ZOD_BODY, ZOD_QUERY, ZOD_PARAMS>,
>({
  body,
  query,
  params,
  output,
  handle,
}: {
  body?: ZOD_BODY;
  query?: ZOD_QUERY;
  params?: ZOD_PARAMS;
  output?: ZOD_OUTPUT;
  handle: T;
}) {
  return withValidation({
    body,
    query,
    params,
    output,
    handle: handle as T & { __output: ZOD_OUTPUT extends ZodSchema ? z.infer<ZOD_OUTPUT> : KnownAny },
    getHandlerSchema: () => {
      const getMethodSchema = (model?: ZodSchema<KnownAny>) =>
        model ? zodToJsonSchema(model, { errorMessages: true }) : null;

      return {
        validation: {
          body: getMethodSchema(body),
          query: getMethodSchema(query),
          output: getMethodSchema(output),
          params: getMethodSchema(params),
        },
      };
    },
    validate: async (data, model, { type, req }) => {
      try {
        model.parse(data);
      } catch (e) {
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          `Zod validation failed. Invalid ${type} on server for ${req.url}. ${getErrorText(e)}`,
          { [type]: data }
        );
      }
    },
  });
}

export { withZod };
