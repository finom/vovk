import * as Yup from 'yup';
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
import { convertSchema } from '@sodaru/yup-to-json-schema';

const getErrorText = (e: unknown) => (e as Yup.ValidationError)?.message ?? String(e);

// Helper function to recursively add descriptions
const enrichWithDescriptions = (jsonSchema: KnownAny, yupDescription: KnownAny): KnownAny => {
  const result = { ...jsonSchema };

  if (yupDescription?.meta?.description && !result.description) {
    result.description = yupDescription.meta.description;
  }

  if (result.properties && yupDescription.fields) {
    // Create a new properties object
    result.properties = { ...result.properties };
    for (const [key, value] of Object.entries(result.properties)) {
      if (yupDescription.fields[key]) {
        result.properties[key] = enrichWithDescriptions(value, yupDescription.fields[key]);
      }
    }
  }

  // Handle array items
  if (result.items && yupDescription.innerType) {
    result.items = enrichWithDescriptions(result.items, yupDescription.innerType);
  }

  // Handle oneOf, anyOf, allOf
  ['oneOf', 'anyOf', 'allOf'].forEach((combiner) => {
    if (result[combiner] && Array.isArray(result[combiner]) && yupDescription.oneOf) {
      result[combiner] = [...result[combiner]].map((subSchema: KnownAny, index: number) => {
        if (yupDescription.oneOf[index]) {
          return enrichWithDescriptions(subSchema, yupDescription.oneOf[index]);
        }
        return subSchema;
      });
    }
  });

  return result;
};

// Apply schema fixes recursively
const applySchemaFixes = (schema: KnownAny): KnownAny => {
  // Create a copy using spread operator instead of deep cloning
  const newSchema = { ...schema };

  // Fix for default values with undefined keys
  if (newSchema.default && typeof newSchema.default === 'object' && !Array.isArray(newSchema.default)) {
    newSchema.default = { ...newSchema.default };

    if (newSchema?.required) {
      for (const key of newSchema.required) {
        delete newSchema.default[key];
      }
    }

    if (Object.keys(newSchema.default).length === 0) {
      delete newSchema.default;
    }
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

function withYup<
  T extends (req: TReq, params: TYupParams extends Yup.Schema<infer U> ? U : Record<string, string>) => KnownAny,
  TYupBody extends Yup.Schema<KnownAny>,
  TYupQuery extends Yup.Schema<KnownAny>,
  TYupParams extends Yup.Schema<KnownAny>,
  TYupOutput extends Yup.Schema<KnownAny>,
  TYupIteration extends Yup.Schema<KnownAny>,
  TReq extends VovkRequest<KnownAny, KnownAny, KnownAny> = VovkRequest<
    TYupBody extends Yup.Schema<infer U> ? U : never,
    TYupQuery extends Yup.Schema<infer U> ? U : undefined,
    TYupParams extends Yup.Schema<infer U> ? U : Record<string, string>
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
  body?: TYupBody;
  query?: TYupQuery;
  params?: TYupParams;
  output?: TYupOutput;
  iteration?: TYupIteration;
  handle: T;
  disableServerSideValidation?: boolean | VovkValidationType[];
  skipSchemaEmission?: boolean | VovkValidationType[];
  validateEachIteration?: boolean;
  options?: {
    validateOptions?: Yup.ValidateOptions;
  };
  preferTransformed?: boolean;
  operationObject?: VovkOperationObject;
}) {
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
      TYupBody extends Yup.Schema<infer U> ? U : KnownAny,
      TYupQuery extends Yup.Schema<infer U> ? U : KnownAny,
      TYupParams extends Yup.Schema<infer U> ? U : Record<string, string>,
      TYupOutput extends Yup.Schema<infer U> ? U : KnownAny,
      TYupIteration extends Yup.Schema<infer U> ? U : KnownAny,
      TIsForm
    >,
    toJSONSchema: (model) => {
      return enrichWithDescriptions(applySchemaFixes(convertSchema(model)), model.describe());
    },
    validate: async (data, model, { type, i }) => {
      try {
        await model.validate(data, options?.validateOptions);
      } catch (e) {
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          `Yup validation failed. Invalid ${type === 'iteration' ? `${type} #${i}` : type} on server: ${getErrorText(e)}`,
          { [type]: data }
        );
      }
    },
    preferTransformed,
    operationObject,
  });
}

export { withYup };
