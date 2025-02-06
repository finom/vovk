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
  T extends (req: REQ, params: KnownAny) => OUTPUT,
  ZOD_BODY extends ZodSchema<unknown> | null,
  ZOD_QUERY extends ZodSchema<Record<string, KnownAny> | undefined> | null = ZodSchema<undefined>,
  REQ extends VovkRequestWithOptionalZod<ZOD_BODY, ZOD_QUERY> = VovkRequestWithOptionalZod<ZOD_BODY, ZOD_QUERY>,
  OUTPUT extends KnownAny = KnownAny,
  ZOD_OUTPUT extends ZodSchema<OUTPUT> = ZodSchema<OUTPUT>,
>(
  bodyModel: ZOD_BODY,
  queryModel: ZOD_QUERY | null,
  givenHandler: T,
  outputModel?: ZOD_OUTPUT
): (req: REQ, params: Parameters<T>[1]) => ReturnType<T>;
function withZod<
  T extends (req: REQ, params: KnownAny) => OUTPUT,
  ZOD_BODY extends ZodSchema<unknown> | null,
  ZOD_QUERY extends ZodSchema<Record<string, KnownAny> | undefined> | null = ZodSchema<undefined>,
  REQ extends VovkRequestWithOptionalZod<ZOD_BODY, ZOD_QUERY> = VovkRequestWithOptionalZod<ZOD_BODY, ZOD_QUERY>,
  OUTPUT extends KnownAny = KnownAny,
  ZOD_OUTPUT extends ZodSchema<OUTPUT> = ZodSchema<OUTPUT>,
>(
  bodyModel: ZOD_BODY,
  givenHandler: T,
  outputModel?: ZOD_OUTPUT
): (req: REQ, params: Parameters<T>[1]) => ReturnType<T>;
function withZod<
  T extends (req: REQ, params: KnownAny) => OUTPUT,
  ZOD_BODY extends ZodSchema<unknown> | null,
  ZOD_QUERY extends ZodSchema<Record<string, KnownAny> | undefined> | null = ZodSchema<undefined>,
  REQ extends VovkRequestWithOptionalZod<ZOD_BODY, ZOD_QUERY> = VovkRequestWithOptionalZod<ZOD_BODY, ZOD_QUERY>,
  OUTPUT extends KnownAny = KnownAny,
  ZOD_OUTPUT extends ZodSchema<OUTPUT> = ZodSchema<OUTPUT>,
>(bodyModel: ZOD_BODY, queryModel: ZOD_QUERY | null | T, givenHandler?: T | ZOD_OUTPUT, outputModel?: ZOD_OUTPUT) {
  if (queryModel && typeof queryModel === 'function') {
    return withZod<T, ZOD_BODY, ZOD_QUERY, REQ>(
      bodyModel,
      null,
      queryModel as unknown as T,
      givenHandler as ZOD_OUTPUT
    );
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
