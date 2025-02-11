import z, { type ZodSchema } from 'zod';
import { setHandlerValidation, HttpException, HttpStatus, type VovkRequest, type KnownAny } from 'vovk';
import zodToJsonSchema from 'zod-to-json-schema';

function withZod<
  T extends (req: REQ, params: KnownAny) => ZOD_OUTPUT extends ZodSchema<infer U> ? U | Promise<U> : KnownAny,
  ZOD_BODY extends ZodSchema<unknown> | null = null,
  ZOD_QUERY extends ZodSchema<KnownAny> | null = null,
  ZOD_OUTPUT extends ZodSchema<KnownAny> = KnownAny,
  REQ extends VovkRequest<
    ZOD_BODY extends ZodSchema ? z.infer<ZOD_BODY> : never,
    ZOD_QUERY extends ZodSchema ? z.infer<ZOD_QUERY> : undefined
  > = VovkRequest<
    ZOD_BODY extends ZodSchema ? z.infer<ZOD_BODY> : never,
    ZOD_QUERY extends ZodSchema ? z.infer<ZOD_QUERY> : undefined
  >,
>({ body, query, output, handle }: { body?: ZOD_BODY; query?: ZOD_QUERY; output?: ZOD_OUTPUT; handle: T }): T {
  const outputHandler = async (req: REQ, params: Parameters<T>[1]) => {
    const outputData = await handle(req, params);
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
        const err = (e as z.ZodError).errors.map((er) => `${er.message} (${er.path.join('/')})`).join(', ');
        throw new HttpException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Zod validation failed. Invalid response on server for ${req.url}. ${err}`,
          { output: outputData }
        );
      }
    }

    return outputData;
  };

  const resultHandler = async (req: REQ, params: Parameters<T>[1]) => {
    if (body) {
      const bodyData: unknown = await req.json();
      try {
        body.parse(bodyData);
      } catch (e) {
        const err = (e as z.ZodError).errors.map((er) => `${er.message} (${er.path.join('/')})`).join(', ');
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          `Zod validation failed. Invalid request body on server for ${req.url}. ${err}`,
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
        const err = (e as z.ZodError).errors.map((er) => `${er.message} (${er.path.join('/')})`).join(', ');
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          `Zod validation failed. Invalid request query on server for ${req.url}. ${err}`,
          { query: queryData }
        );
      }
    }

    return outputHandler(req, params);
  };

  void setHandlerValidation(resultHandler, {
    body: body ? zodToJsonSchema(body) : null,
    query: query ? zodToJsonSchema(query) : null,
    output: output ? zodToJsonSchema(output) : null,
  });

  return resultHandler as T;
}

export { withZod };
