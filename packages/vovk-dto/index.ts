import { validate, type ValidationError, type ValidatorOptions } from 'class-validator';
import { ClassTransformOptions, plainToInstance, type ClassConstructor } from 'class-transformer';
import {
  withValidationLibrary,
  HttpException,
  HttpStatus,
  type VovkRequest,
  type KnownAny,
  type VovkValidationType,
  type VovkTypedMethod,
  type VovkOperationObject,
} from 'vovk';
import { validationMetadatasToSchemas, targetConstructorToSchema } from 'class-validator-jsonschema';
export { validateOnClient } from './validateOnClient.js';

// Apply schema fixes recursively
const addDefinitions = (schema: KnownAny, schemas: ReturnType<typeof validationMetadatasToSchemas>): KnownAny => {
  // get all $refs from the schema recursively
  const getRefs = (schema: KnownAny, refs: string[] = []) => {
    if (schema.$ref) {
      refs.push(schema.$ref);
    }
    if (schema.items?.$ref) {
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
  // Create a new definitions object based on the original
  const newDefinitions = { ...(schema.definitions || {}) };

  for (let i = 0; i < refs.length; i++) {
    const ref = refs[i];
    const key = ref.replace('#/definitions/', '');
    const storageDefinition = schemas[key];
    if (storageDefinition) {
      newDefinitions[key] = storageDefinition;
      refs.push(...getRefs(storageDefinition));
    }
  }

  // Return new object with updated definitions
  return {
    ...schema,
    definitions: newDefinitions,
  };
};

// Apply schema fixes recursively
const applySchemaFixes = (schema: KnownAny): KnownAny => {
  // Create a copy using spread operator instead of deep cloning
  const newSchema = { ...schema };

  // Rename "uri" format to "url" for string types
  if (newSchema.type === 'string' && newSchema.format === 'url') {
    newSchema.format = 'uri';
  }

  // Apply fixes to nested properties
  if (newSchema.properties) {
    newSchema.properties = Object.fromEntries(
      Object.entries(newSchema.properties).map(([key, prop]) => [key, applySchemaFixes(prop)])
    );
  }

  // Apply fixes to array items
  if (newSchema.items) {
    newSchema.items = applySchemaFixes(newSchema.items);
  }

  // Apply fixes to combiners
  ['oneOf', 'anyOf', 'allOf'].forEach((combiner) => {
    if (newSchema[combiner] && Array.isArray(newSchema[combiner])) {
      newSchema[combiner] = [...newSchema[combiner]].map((subSchema: KnownAny) => applySchemaFixes(subSchema));
    }
  });

  return newSchema;
};

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
  TIsForm extends boolean = false,
>({
  isForm,
  body,
  query,
  params,
  output,
  iteration,
  handle,
  disableServerSideValidation,
  skipSchemaEmission,
  validateEachIteration,
  options,
  preferTransformed,
  operationObject,
}: {
  isForm?: TIsForm;
  body?: BODY_DTO;
  query?: QUERY_DTO;
  params?: PARAMS_DTO;
  output?: OUTPUT_DTO;
  iteration?: ITERATION_DTO;
  handle: T;
  disableServerSideValidation?: boolean | VovkValidationType[];
  skipSchemaEmission?: boolean | VovkValidationType[];
  validateEachIteration?: boolean;
  options?: {
    classTransformOptions?: ClassTransformOptions;
    validatorOptions?: ValidatorOptions;
  };
  preferTransformed?: boolean;
  operationObject?: VovkOperationObject;
}) {
  const schemas = validationMetadatasToSchemas();

  return withValidationLibrary({
    isForm,
    body,
    query,
    params,
    output,
    iteration,
    disableServerSideValidation,
    skipSchemaEmission,
    validateEachIteration,
    handle: handle as VovkTypedMethod<
      T,
      BODY_DTO extends ClassConstructor<infer U> ? U : KnownAny,
      QUERY_DTO extends ClassConstructor<infer U> ? U : KnownAny,
      PARAMS_DTO extends ClassConstructor<infer U> ? U : KnownAny,
      OUTPUT_DTO extends ClassConstructor<infer U> ? U : KnownAny,
      ITERATION_DTO extends ClassConstructor<infer U> ? U : KnownAny,
      TIsForm
    >,
    toJSONSchema: (dto) => {
      const schema = {
        'x-isDto': true,
        definitions: {} as Record<string, KnownAny>,
        ...targetConstructorToSchema(dto),
      };

      return addDefinitions(applySchemaFixes(schema), schemas);
    },
    validate: async (data, dto, { type, status, i }) => {
      data = data instanceof FormData ? Object.fromEntries(data.entries()) : data;
      const instance = plainToInstance(dto, data, options?.classTransformOptions);
      const errors: ValidationError[] = await validate(instance as object, options?.validatorOptions);

      if (errors.length > 0) {
        const err =
          errors
            .map((e) => Object.values(e.constraints || {}))
            .flat()
            .join(', ') || errors.toString();
        throw new HttpException(
          status ?? HttpStatus.BAD_REQUEST,
          `DTO validation failed. Invalid ${type === 'iteration' ? `${type} #${i}` : type} on server: ${err}`,
          { errors }
        );
      }

      return instance;
    },
    preferTransformed,
    operationObject,
  });
}

export { withDto };
