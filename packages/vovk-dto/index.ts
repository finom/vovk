import { validate, type ValidationError } from 'class-validator';
import { plainToInstance, type ClassConstructor } from 'class-transformer';
import { setHandlerValidation, HttpException, HttpStatus, type VovkRequest, type KnownAny } from 'vovk';

function withDto<
  T extends (req: REQ, params: KnownAny) => OUTPUT | Promise<OUTPUT>,
  BODY extends object | null = null,
  QUERY extends object | null = null,
  OUTPUT extends object | null = KnownAny,
  REQ extends VovkRequest<BODY extends object ? BODY : never, QUERY extends object ? QUERY : undefined> = VovkRequest<
    BODY extends object ? BODY : never,
    QUERY extends object ? QUERY : undefined
  >,
>({
  body,
  query,
  output,
  handle,
}: {
  body?: ClassConstructor<BODY>;
  query?: ClassConstructor<QUERY>;
  output?: ClassConstructor<OUTPUT>;
  handle: T;
}): T {
  const outputHandler = async (req: REQ, params: KnownAny): Promise<OUTPUT> => {
    const outputData = await handle(req, params);
    if (output) {
      if (!outputData) {
        throw new HttpException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Output is required. You probably forgot to return something from your handler.'
        );
      }
      const outputInstance = plainToInstance(output, outputData);
      const outputErrors: ValidationError[] = await validate(outputInstance!);

      if (outputErrors.length > 0) {
        const err = outputErrors.map((e) => Object.values(e.constraints || {}).join(', ')).join(', ');
        throw new HttpException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Validation failed. Invalid response on server for ${req.url}. ${err}`
        );
      }
    }

    return outputData;
  };

  const resultHandler = async (req: REQ, params: Parameters<T>[1]) => {
    if (body) {
      const bodyData: unknown = await req.json();
      const bodyInstance = plainToInstance(body, bodyData);
      const bodyErrors: ValidationError[] = await validate(bodyInstance as object);

      if (bodyErrors.length > 0) {
        const err = bodyErrors.map((e) => Object.values(e.constraints || {}).join(', ')).join(', ');
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          `Validation failed. Invalid request body on server for ${req.url}. ${err}`
        );
      }
      // redeclare to add ability to call req.json() again
      req.json = () => Promise.resolve(bodyData as BODY extends object ? BODY : never);
      req.vovk.body = () => Promise.resolve(bodyInstance as BODY extends object ? BODY : never);
    }

    if (query) {
      const queryData = req.vovk.query();
      const queryInstance = plainToInstance(query, queryData);
      const queryErrors: ValidationError[] = await validate(queryInstance as object);

      if (queryErrors.length > 0) {
        const err = queryErrors.map((e) => Object.values(e.constraints || {}).join(', ')).join(', ');
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          `Validation failed. Invalid request query on server for ${req.url}. ${err}`,
          { query: queryData }
        );
      }

      req.vovk.query = () => queryInstance as QUERY extends object ? QUERY : never;
    }

    return outputHandler(req, params);
  };

  void setHandlerValidation(resultHandler, {
    body: body ? { isDTO: true } : null,
    query: query ? { isDTO: true } : null,
    output: output ? { isDTO: true } : null,
  });

  return resultHandler as T;
}

export { withDto };
