import { validate, type ValidationError } from 'class-validator';
import { plainToInstance, type ClassConstructor } from 'class-transformer';
import { withValidation, HttpException, HttpStatus, type VovkRequest, type KnownAny } from 'vovk';
import { targetConstructorToSchema } from 'class-validator-jsonschema';

function withDto<
  T extends (req: REQ, params: PARAMS_DTO extends ClassConstructor<infer U> ? U : Record<string, string>) => KnownAny,
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
}) {
  return withValidation({
    body,
    query,
    params,
    output,
    handle: handle as T & { __output: OUTPUT_DTO extends ClassConstructor<infer U> ? U : KnownAny },
    getHandlerSchema: () => {
      const getMethodSchema = (dto?: ClassConstructor<KnownAny>) => {
        const schema = dto ? targetConstructorToSchema(dto) : null;
        return schema ? { 'x-isDto': true, ...schema } : null;
      };

      return {
        validation: {
          body: getMethodSchema(body),
          query: getMethodSchema(query),
          output: getMethodSchema(output),
          params: getMethodSchema(params),
        },
      };
    },
    validate: async (data, dto, { type, req }) => {
      const instance = plainToInstance(dto, data);
      const errors: ValidationError[] = await validate(instance as object);

      if (errors.length > 0) {
        const err = errors.map((e) => Object.values(e.constraints || {}).join(', ')).join(', ');
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          `Validation failed. Invalid ${type} on server for ${req.url}. ${err}`
        );
      }

      return instance;
    },
  });
}

export { withDto };
