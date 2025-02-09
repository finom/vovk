import z, { type ZodSchema } from 'zod';
import { setHandlerValidation, HttpException, HttpStatus, type VovkRequest, type KnownAny } from 'vovk';
import zodToJsonSchema from 'zod-to-json-schema';

type VovkRequestWithOptionalZod<
  ZOD_BODY extends ZodSchema | null = null,
  ZOD_QUERY extends ZodSchema | null = null,
> = VovkRequest<
  ZOD_BODY extends ZodSchema ? z.infer<ZOD_BODY> : never,
  ZOD_QUERY extends ZodSchema ? z.infer<ZOD_QUERY> : undefined
>;
function withZod<
  T extends (req: REQ, params: KnownAny) => ZOD_OUTPUT extends ZodSchema ? z.infer<ZOD_OUTPUT> : KnownAny,
  ZOD_BODY extends ZodSchema<unknown> | null,
  ZOD_QUERY extends ZodSchema<KnownAny> | null = null,
  ZOD_OUTPUT extends ZodSchema<KnownAny> | null = null,
  REQ extends VovkRequestWithOptionalZod<ZOD_BODY, ZOD_QUERY> = VovkRequestWithOptionalZod<ZOD_BODY, ZOD_QUERY>,
>(
  bodyModel: ZOD_BODY,
  queryModel: ZOD_QUERY | null,
  outputModel: ZOD_OUTPUT | null,
  givenHandler: T
): (req: REQ, params: Parameters<T>[1]) => ReturnType<T>;
function withZod<
  T extends (req: REQ, params: KnownAny) => ZOD_OUTPUT extends ZodSchema ? z.infer<ZOD_OUTPUT> : KnownAny,
  ZOD_BODY extends ZodSchema<unknown> | null,
  ZOD_QUERY extends ZodSchema<KnownAny> | null = null,
  ZOD_OUTPUT extends ZodSchema<KnownAny> | null = null,
  REQ extends VovkRequestWithOptionalZod<ZOD_BODY, ZOD_QUERY> = VovkRequestWithOptionalZod<ZOD_BODY, ZOD_QUERY>,
>(
  bodyModel: ZOD_BODY,
  queryModel: ZOD_QUERY | null,
  givenHandler: T
): (req: REQ, params: Parameters<T>[1]) => ReturnType<T>;
function withZod<
  T extends (req: REQ, params: KnownAny) => ZOD_OUTPUT extends ZodSchema ? z.infer<ZOD_OUTPUT> : KnownAny,
  ZOD_BODY extends ZodSchema<unknown> | null,
  ZOD_QUERY extends ZodSchema<KnownAny> | null = null,
  ZOD_OUTPUT extends ZodSchema<KnownAny> | null = null,
  REQ extends VovkRequestWithOptionalZod<ZOD_BODY, ZOD_QUERY> = VovkRequestWithOptionalZod<ZOD_BODY, ZOD_QUERY>,
>(bodyModel: ZOD_BODY, givenHandler: T): (req: REQ, params: Parameters<T>[1]) => ReturnType<T>;
function withZod<
  T extends (req: REQ, params: KnownAny) => ZOD_OUTPUT extends ZodSchema ? z.infer<ZOD_OUTPUT> : KnownAny,
  ZOD_BODY extends ZodSchema<unknown> | null,
  ZOD_QUERY extends ZodSchema<KnownAny> | null = null,
  ZOD_OUTPUT extends ZodSchema<KnownAny> | null = null,
  REQ extends VovkRequestWithOptionalZod<ZOD_BODY, ZOD_QUERY> = VovkRequestWithOptionalZod<ZOD_BODY, ZOD_QUERY>,
>(bodyModel: ZOD_BODY, queryModel: ZOD_QUERY | null | T, outputModel?: ZOD_OUTPUT | T, givenHandler?: T) {
  if (typeof outputModel === 'function') {
    return withZod<T, ZOD_BODY, ZOD_QUERY, ZOD_OUTPUT, REQ>(bodyModel, queryModel as ZOD_QUERY, null, outputModel);
  }

  if (typeof queryModel === 'function') {
    return withZod<T, ZOD_BODY, ZOD_QUERY, null, REQ>(bodyModel, null, null, queryModel);
  }

  const outputHandler = async (req: REQ, params: Parameters<T>[1]) => {
    const output = await (givenHandler as T)(req, params);
    if (outputModel) {
      if (!output) {
        throw new HttpException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Output is required. You probably forgot to return something from your handler.'
        );
      }
      try {
        outputModel.parse(output);
      } catch (e) {
        const err = (e as z.ZodError).errors.map((er) => `${er.message} (${er.path.join('/')})`).join(', ');
        throw new HttpException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Zod validation failed. Invalid response on server for ${req.url}. ${err}`
        );
      }
    }

    return output;
  };

  const handler = async (req: REQ, params: Parameters<T>[1]) => {
    if (bodyModel) {
      const body: unknown = await req.json();
      try {
        bodyModel.parse(body);
      } catch (e) {
        const err = (e as z.ZodError).errors.map((er) => `${er.message} (${er.path.join('/')})`).join(', ');
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          `Zod validation failed. Invalid request body on server for ${req.url}. ${err}`
        );
      }
      // redeclare to add ability to call req.json() again
      req.json = () => Promise.resolve(body as ZOD_BODY extends ZodSchema ? z.infer<ZOD_BODY> : never);
    }

    if (queryModel) {
      const query = req.vovk.query();

      try {
        queryModel.parse(query);
      } catch (e) {
        const err = (e as z.ZodError).errors.map((er) => `${er.message} (${er.path.join('/')})`).join(', ');
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          `Zod validation failed. Invalid request query on server for ${req.url}. ${err}`
        );
      }
    }

    return outputHandler(req, params);
  };

  void setHandlerValidation(handler, {
    body: bodyModel ? zodToJsonSchema(bodyModel) : null,
    query: queryModel ? zodToJsonSchema(queryModel) : null,
    output: outputModel ? zodToJsonSchema(outputModel) : null,
  });

  return handler as (req: REQ, params: Parameters<T>[1]) => ReturnType<T>;
}

export { withZod };
