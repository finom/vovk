import { validate, type ValidationError } from 'class-validator';
import { plainToInstance, type ClassConstructor } from 'class-transformer';
import {
  withValidation,
  HttpException,
  HttpStatus,
  type VovkRequest,
  type KnownAny,
  type VovkValidationType,
} from 'vovk';
import { validationMetadatasToSchemas, targetConstructorToSchema } from 'class-validator-jsonschema';

function withDto<
  T extends (req: REQ, params: PARAMS_DTO extends ClassConstructor<infer U> ? U : Record<string, string>) => KnownAny,
  BODY_DTO extends ClassConstructor<KnownAny>,
  QUERY_DTO extends ClassConstructor<KnownAny>,
  PARAMS_DTO extends ClassConstructor<KnownAny>,
  OUTPUT_DTO extends ClassConstructor<KnownAny>,
  ITERATION_DTO extends ClassConstructor<KnownAny>,
  REQ extends VovkRequest<KnownAny, KnownAny, KnownAny> = VovkRequest<
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
  const schemas = validationMetadatasToSchemas();

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
    getJSONSchemaFromModel: (dto) => {
      const schema = {
        'x-isDto': true,
        definitions: {} as Record<string, any>,
        ...targetConstructorToSchema(dto),
      };

      // get all $refs from the schema recursively
      const getRefs = (schema: any, refs: string[] = []) => {
        if (schema.$ref) {
          refs.push(schema.$ref);
        }
        if(schema.items?.$ref) {
          refs.push(schema.items.$ref);
        }
        if (schema.properties) {
          for (const key in schema.properties) {
            getRefs(schema.properties[key], refs);
          }
        }
        return refs;
      };
      const refs = getRefs(schema);
      for (let i = 0; i < refs.length; i++) {
        const ref = refs[i];
        const key = ref.replace('#/definitions/', '');
        const storageDefinition = schemas[key];
        if (storageDefinition) {
          schema.definitions[key] = storageDefinition;
          refs.push(...getRefs(storageDefinition));
        }
      }

      return schema;
    },
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
