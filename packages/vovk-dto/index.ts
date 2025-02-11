import { validate, type ValidationError } from 'class-validator';
import { plainToInstance, type ClassConstructor } from 'class-transformer';
import { setHandlerValidation, HttpException, HttpStatus, type VovkRequest, type KnownAny } from 'vovk';

/*
  REQ extends VovkRequest<
    ZOD_BODY extends ZodSchema<infer U> ? U : never,
    ZOD_QUERY extends ZodSchema<infer U> ? U : undefined
  > = VovkRequest<
    ZOD_BODY extends ZodSchema<infer U> ? U : never,
    ZOD_QUERY extends ZodSchema<infer U> ? U : undefined
  >,
*/

function withDto<
  T extends (req: REQ, params?: PARAMS_DTO extends ClassConstructor<infer U> ? U : Record<string, string>) => OUTPUT_DTO extends ClassConstructor<infer U> ? U | Promise<U> : KnownAny,
  BODY_DTO extends  ClassConstructor<KnownAny>,
  QUERY_DTO extends ClassConstructor<KnownAny>,
  OUTPUT_DTO extends ClassConstructor<KnownAny>,
  PARAMS_DTO extends ClassConstructor<KnownAny>,
  REQ extends VovkRequest<
    BODY_DTO extends ClassConstructor<infer U> ? U : never,
    QUERY_DTO extends ClassConstructor<infer U> ? U : undefined
  > = VovkRequest<
    BODY_DTO extends ClassConstructor<infer U> ? U : never,
    QUERY_DTO extends ClassConstructor<infer U> ? U : undefined
  >,
>({
  body: bodyDto,
  query: queryDto,
  params: paramsDto,
  output: outputDto,
  handle,
}: {
  body?: BODY_DTO;
  query?: QUERY_DTO;
  params?: PARAMS_DTO;
  output?: OUTPUT_DTO;
  handle: T;
}): T {
  const outputHandler = async (req: REQ, params: Parameters<T>[1]) => {
    const outputData = await handle(req, params);
    if (outputDto) {
      if (!outputData) {
        throw new HttpException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Output is required. You probably forgot to return something from your handler.'
        );
      }
      const outputInstance = plainToInstance(outputDto, outputData);
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
    if (bodyDto) {
      const bodyData: unknown = await req.json();
      const bodyInstance = plainToInstance(bodyDto, bodyData);
      const bodyErrors: ValidationError[] = await validate(bodyInstance as object);

      if (bodyErrors.length > 0) {
        const err = bodyErrors.map((e) => Object.values(e.constraints || {}).join(', ')).join(', ');
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          `Validation failed. Invalid request body on server for ${req.url}. ${err}`
        );
      }
      // redeclare to add ability to call req.json() again
      req.json = () => Promise.resolve(bodyData as BODY_DTO extends ClassConstructor<infer U> ? U : never);
      req.vovk.body = () => Promise.resolve(bodyInstance as BODY_DTO extends ClassConstructor<infer U> ? U : never);
    }

    if (queryDto) {
      const queryData = req.vovk.query();
      const queryInstance = plainToInstance(queryDto, queryData);
      const queryErrors: ValidationError[] = await validate(queryInstance as object);

      if (queryErrors.length > 0) {
        const err = queryErrors.map((e) => Object.values(e.constraints || {}).join(', ')).join(', ');
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          `Validation failed. Invalid request query on server for ${req.url}. ${err}`,
          { query: queryData }
        );
      }

      req.vovk.query = () => queryInstance as QUERY_DTO extends ClassConstructor<infer U> ? U : never;
    }

    if (paramsDto) {
      const paramsData = req.vovk.params();
      const paramsInstance = plainToInstance(paramsDto, paramsData);
      const paramsErrors: ValidationError[] = await validate(paramsInstance as object);

      if (paramsErrors.length > 0) {
        const err = paramsErrors.map((e) => Object.values(e.constraints || {}).join(', ')).join(', ');
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          `Validation failed. Invalid request params on server for ${req.url}. ${err}`,
          { params: paramsData }
        );
      }

      req.vovk.params = () => paramsInstance;
    }

    return outputHandler(req, params);
  };

  void setHandlerValidation(resultHandler, {
    body: bodyDto ? { isDTO: true } : null,
    query: queryDto ? { isDTO: true } : null,
    output: outputDto ? { isDTO: true } : null,
    params: paramsDto ? { isDTO: true } : null,
  });

  return resultHandler as T;
}

export { withDto };
