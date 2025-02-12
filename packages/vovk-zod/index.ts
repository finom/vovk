import z, { type ZodSchema } from 'zod';
import { setHandlerValidation, HttpException, HttpStatus, type VovkRequest, type KnownAny } from 'vovk';
import zodToJsonSchema from 'zod-to-json-schema';

const getErrorText = (e: unknown) =>
  (e as z.ZodError).errors?.map((er) => `${er.message} (${er.path.join('/')})`).join(', ') ?? String(e);

function withZod<
  T extends (
    req: REQ,
    params: ZOD_PARAMS extends ZodSchema<infer U> ? U : Record<string, string>
  ) => ZOD_OUTPUT extends ZodSchema<infer U> ? U | Promise<U> : KnownAny,
  ZOD_BODY extends ZodSchema<KnownAny>,
  ZOD_QUERY extends ZodSchema<KnownAny>,
  ZOD_OUTPUT extends ZodSchema<KnownAny>,
  ZOD_PARAMS extends ZodSchema<KnownAny>,
  REQ extends VovkRequest<
    ZOD_BODY extends ZodSchema<infer U> ? U : never,
    ZOD_QUERY extends ZodSchema<infer U> ? U : undefined,
    ZOD_PARAMS extends ZodSchema<infer U> ? U : Record<string, string>
  > = VovkRequest<
    ZOD_BODY extends ZodSchema<infer U> ? U : never,
    ZOD_QUERY extends ZodSchema<infer U> ? U : undefined,
    ZOD_PARAMS extends ZodSchema<infer U> ? U : Record<string, string>
  >,
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
  const outputHandler = async (req: REQ, handlerParams: Parameters<T>[1]) => {
    const outputData = await handle(req, handlerParams);
    if (output) {
      if (!outputData) {
        throw new HttpException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Output is required. You probably forgot to return something from your handler.'
        );
      }
      try {
        output.parse(outputData);
      } catch (e) {
        throw new HttpException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Zod validation failed. Invalid response on server for ${req.url}. ${getErrorText(e)}`,
          { output: outputData }
        );
      }
    }

    return outputData;
  };

  const resultHandler = async (req: REQ, handlerParams: Parameters<T>[1]) => {
    if (body) {
      const bodyData: unknown = await req.json();
      try {
        body.parse(bodyData);
      } catch (e) {
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          `Zod validation failed. Invalid request body on server for ${req.url}. ${getErrorText(e)}`,
          { body: bodyData }
        );
      }
      // redeclare to add ability to call req.json() again
      req.json = () => Promise.resolve(bodyData as ZOD_BODY extends ZodSchema ? z.infer<ZOD_BODY> : never);
    }

    if (query) {
      const queryData = req.vovk.query();

      try {
        query.parse(queryData);
      } catch (e) {
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          `Zod validation failed. Invalid request query on server for ${req.url}. ${getErrorText(e)}`,
          { query: queryData }
        );
      }
    }

    if (params) {
      const paramsData = req.vovk.params();

      try {
        params.parse(paramsData);
      } catch (e) {
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          `Zod validation failed. Invalid request params on server for ${req.url}. ${getErrorText(e)}`,
          { params: paramsData }
        );
      }
    }

    return outputHandler(req, handlerParams);
  };

  void setHandlerValidation(resultHandler, {
    body: body ? zodToJsonSchema(body) : null,
    query: query ? zodToJsonSchema(query) : null,
    output: output ? zodToJsonSchema(output) : null,
    params: params ? zodToJsonSchema(params) : null,
  });

  return resultHandler as T;
}

export { withZod };
