import { validate, type ValidationError } from 'class-validator';
import { plainToInstance, type ClassConstructor } from 'class-transformer';
import { setHandlerValidation, HttpException, HttpStatus, type VovkRequest, type KnownAny } from 'vovk';
import { targetConstructorToSchema } from 'class-validator-jsonschema';

function withDto<
  T extends (
    req: REQ,
    params?: Record<string, string>
  ) => OUTPUT_DTO extends ClassConstructor<infer U> ? U | Promise<U> : KnownAny,
  BODY_DTO extends ClassConstructor<KnownAny>,
  QUERY_DTO extends ClassConstructor<KnownAny>,
  OUTPUT_DTO extends ClassConstructor<KnownAny>,
  PARAMS_DTO extends ClassConstructor<KnownAny>,
  REQ extends VovkRequest<
    BODY_DTO extends ClassConstructor<infer U> ? U : never,
    QUERY_DTO extends ClassConstructor<infer U> ? U : undefined,
    PARAMS_DTO extends ClassConstructor<infer U> ? U : Record<string, string>
  > = VovkRequest<
    BODY_DTO extends ClassConstructor<infer U> ? U : never,
    QUERY_DTO extends ClassConstructor<infer U> ? U : undefined,
    PARAMS_DTO extends ClassConstructor<infer U> ? U : Record<string, string>
  >,
>({
  body,
  query,
  params,
  output,
  handle,
}: {
  body?: BODY_DTO;
  query?: QUERY_DTO;
  params?: PARAMS_DTO;
  output?: OUTPUT_DTO;
  handle: T;
}): T {
  const outputHandler = async (req: REQ, handlerParams: Parameters<T>[1]) => {
    const outputData = await handle(req, handlerParams);
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

  const resultHandler = async (req: REQ, handlerParams: Parameters<T>[1]) => {
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
      req.json = () => Promise.resolve(bodyData as BODY_DTO extends ClassConstructor<infer U> ? U : never);
      req.vovk.body = () => Promise.resolve(bodyInstance as BODY_DTO extends ClassConstructor<infer U> ? U : never);
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

      req.vovk.query = () => queryInstance as QUERY_DTO extends ClassConstructor<infer U> ? U : never;
    }

    if (params) {
      const paramsData = req.vovk.params();
      const paramsInstance = plainToInstance(params, paramsData);
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

    return outputHandler(req, handlerParams);
  };

  const getSchema = (dto?: ClassConstructor<KnownAny>) => {
    if (!dto) return null;
    const schema = targetConstructorToSchema(dto);
    return schema ? { ...schema, 'x-isDto': true } : null;
  };

  void setHandlerValidation(resultHandler, {
    body: getSchema(body),
    query: getSchema(query),
    output: getSchema(output),
    params: getSchema(params),
  });

  return resultHandler as T;
}

export { withDto };
