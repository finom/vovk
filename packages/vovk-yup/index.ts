import * as Yup from 'yup';
import { withValidation, HttpException, HttpStatus, type VovkRequest, type KnownAny, VovkValidationType } from 'vovk';
import { convertSchema } from '@sodaru/yup-to-json-schema';

const getErrorText = (e: unknown) => (e as Yup.ValidationError)?.errors.join(', ') ?? String(e);

// Helper function to recursively add descriptions
const enrichWithDescriptions = (jsonSchema: KnownAny, yupDescription: KnownAny) => {
  // Add description to current level if available
  if (yupDescription?.meta?.description && !jsonSchema.description) {
    jsonSchema.description = yupDescription.meta.description;
  }

  // Handle object properties
  if (jsonSchema.properties && yupDescription.fields) {
    for (const [key, value] of Object.entries(jsonSchema.properties)) {
      if (yupDescription.fields[key]) {
        enrichWithDescriptions(value, yupDescription.fields[key]);
      }
    }
  }

  // Handle array items
  if (jsonSchema.items && yupDescription.innerType) {
    enrichWithDescriptions(jsonSchema.items, yupDescription.innerType);
  }

  // Handle oneOf, anyOf, allOf
  ['oneOf', 'anyOf', 'allOf'].forEach((combiner) => {
    if (jsonSchema[combiner] && Array.isArray(jsonSchema[combiner]) && yupDescription.oneOf) {
      jsonSchema[combiner].forEach((subSchema: any, index: number) => {
        if (yupDescription.oneOf[index]) {
          enrichWithDescriptions(subSchema, yupDescription.oneOf[index]);
        }
      });
    }
  });
};

function withYup<
  T extends (req: REQ, params: YUP_PARAMS extends Yup.Schema<infer U> ? U : Record<string, string>) => KnownAny,
  YUP_BODY extends Yup.Schema<KnownAny>,
  YUP_QUERY extends Yup.Schema<KnownAny>,
  YUP_PARAMS extends Yup.Schema<KnownAny>,
  YUP_OUTPUT extends Yup.Schema<KnownAny>,
  YUP_ITERATION extends Yup.Schema<KnownAny>,
  REQ extends VovkRequest<
    YUP_BODY extends Yup.Schema<infer U> ? U : never,
    YUP_QUERY extends Yup.Schema<infer U> ? U : undefined,
    YUP_PARAMS extends Yup.Schema<infer U> ? U : Record<string, string>
  > = VovkRequest<
    YUP_BODY extends Yup.Schema<infer U> ? U : never,
    YUP_QUERY extends Yup.Schema<infer U> ? U : undefined,
    YUP_PARAMS extends Yup.Schema<infer U> ? U : Record<string, string>
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
  body?: YUP_BODY;
  query?: YUP_QUERY;
  params?: YUP_PARAMS;
  output?: YUP_OUTPUT;
  iteration?: YUP_ITERATION;
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
      __output: YUP_OUTPUT extends Yup.Schema<infer U> ? U : KnownAny;
      __iteration: YUP_ITERATION extends Yup.Schema<infer U> ? U : KnownAny;
    },
    getHandlerSchema: ({ skipSchemaEmissionKeys }) => {
      const getSchema = (key: VovkValidationType, model?: Yup.Schema<KnownAny>) => {
        const schema = !skipSchemaEmissionKeys.includes(key) && model ? convertSchema(model) : null;

        if (schema) {
          // Fix for default values with undefined keys
          if (schema.default && typeof schema.default === 'object' && !Array.isArray(schema.default)) {
            if (schema?.required) {
              for (const key of schema.required) {
                delete schema.default[key];
              }
            }

            if (Object.keys(schema.default).length === 0) {
              delete schema.default;
            }
          }

          // Add descriptions recursively
          if (model) {
            enrichWithDescriptions(schema, model.describe());
          }
        }

        return schema;
      };

      return {
        validation: {
          body: getSchema('body', body),
          query: getSchema('query', query),
          output: getSchema('output', output),
          params: getSchema('params', params),
          iteration: getSchema('iteration', iteration),
        },
      };
    },
    validate: async (data, model, { type, req, i }) => {
      try {
        await model.validate(data);
      } catch (e) {
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          `Yup validation failed. Invalid ${type === 'iteration' ? `${type} #${i}` : type} on server for ${req.url}. ${getErrorText(e)}`,
          { [type]: data }
        );
      }
    },
  });
}

withYup.formData = null as unknown as Yup.Schema<FormData>;

export { withYup };
