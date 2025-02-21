import { validate, type ValidationError } from 'class-validator';
import { plainToInstance, type ClassConstructor } from 'class-transformer';
import { withValidation, HttpException, HttpStatus, type VovkRequest, type KnownAny, VovkValidationType } from 'vovk';
import { targetConstructorToSchema } from 'class-validator-jsonschema';

function withDto<
  T extends (req: REQ, params: PARAMS_DTO extends ClassConstructor<infer U> ? U : Record<string, string>) => KnownAny,
  BODY_DTO extends ClassConstructor<KnownAny>,
  QUERY_DTO extends ClassConstructor<KnownAny>,
  PARAMS_DTO extends ClassConstructor<KnownAny>,
  OUTPUT_DTO extends ClassConstructor<KnownAny>,
  ITERATION_DTO extends ClassConstructor<KnownAny>,
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
  iteration,
  handle,
  skipServerSideValidation,
  skipSchemaEmission,
  validateEveryIteration,
}: {
  body?: BODY_DTO;
  query?: QUERY_DTO;
  params?: PARAMS_DTO;
  output?: OUTPUT_DTO;
  iteration?: ITERATION_DTO;
  handle: T;
  skipServerSideValidation?: boolean | VovkValidationType[];
  skipSchemaEmission?: boolean | VovkValidationType[];
  validateEveryIteration?: boolean;
}) {
  return withValidation({
    body,
    query,
    params,
    output,
    iteration,
    skipServerSideValidation,
    skipSchemaEmission,
    validateEveryIteration,
    handle: handle as T & {
      __output: OUTPUT_DTO extends ClassConstructor<infer U> ? U : KnownAny;
      __iteration: ITERATION_DTO extends ClassConstructor<infer U> ? U : KnownAny;
    },
    getHandlerSchema: ({ skipSchemaEmissionKeys }) => {
      const getMethodSchema = (key: VovkValidationType, dto?: ClassConstructor<KnownAny>) => {
        const schema = !skipSchemaEmissionKeys.includes(key) && dto ? targetConstructorToSchema(dto) : null;
        return schema ? { 'x-isDto': true, ...schema } : null;
      };

      return {
        validation: {
          body: getMethodSchema('body', body),
          query: getMethodSchema('query', query),
          output: getMethodSchema('output', output),
          params: getMethodSchema('params', params),
          iteration: getMethodSchema('iteration', iteration),
        },
      };
    },
    validate: async (data, dto, { type, req, status }) => {
      const instance = plainToInstance(dto, data);
      const errors: ValidationError[] = await validate(instance as object);

      if (errors.length > 0) {
        const err = errors.map((e) => Object.values(e.constraints || {}).join(', ')).join(', ');
        throw new HttpException(
          status ?? HttpStatus.BAD_REQUEST,
          `Validation failed. Invalid ${type} on server for ${req.url}. ${err}`
        );
      }

      return instance;
    },
  });
}

export { withDto };
