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
  REQ extends VovkRequest<KnownAny, KnownAny> = VovkRequest<
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
  disableServerSideValidation,
  skipSchemaEmission,
  validateEveryIteration,
}: {
  body?: BODY_DTO;
  query?: QUERY_DTO;
  params?: PARAMS_DTO;
  output?: OUTPUT_DTO;
  iteration?: ITERATION_DTO;
  handle: T;
  disableServerSideValidation?: boolean | VovkValidationType[];
  skipSchemaEmission?: boolean | VovkValidationType[];
  validateEveryIteration?: boolean;
}) {
  return withValidation({
    body,
    query,
    params,
    output,
    iteration,
    disableServerSideValidation,
    skipSchemaEmission,
    validateEveryIteration,
    handle: handle as T & {
      __output: OUTPUT_DTO extends ClassConstructor<infer U> ? U : KnownAny;
      __iteration: ITERATION_DTO extends ClassConstructor<infer U> ? U : KnownAny;
    },
    getJSONSchemaFromModel: (dto) => ({
      'x-isDto': true,
      ...targetConstructorToSchema(dto),
    }),
    validate: async (data, dto, { type, req, status, i }) => {
      const instance = plainToInstance(dto, data);
      const errors: ValidationError[] = await validate(instance as object);

      if (errors.length > 0) {
        const err = errors.map((e) => Object.values(e.constraints || {}).join(', ')).join(', ');
        throw new HttpException(
          status ?? HttpStatus.BAD_REQUEST,
          `Validation failed. Invalid ${type === 'iteration' ? `${type} #${i}` : type} on server for ${req.url}. ${err}`
        );
      }

      return instance;
    },
  });
}

withDto.formData = null as unknown as typeof FormData;

export { withDto };
