import { Ajv, Options } from 'ajv';
import Ajv2020 from 'ajv/dist/2020';
import ajvFormats from 'ajv-formats';
import ajvLocalize from 'ajv-i18n';
import ajvErrors from 'ajv-errors';
import {
  createValidateOnClient,
  HttpException,
  HttpStatus,
  KnownAny,
  VovkBasicJSONSchema,
  type VovkSchema,
  type VovkValidateOnClient,
} from 'vovk';

type Lang = keyof typeof ajvLocalize;

export type VovkAjvConfig = {
  options?: Options;
  localize?: Lang;
  target?: 'draft-2020-12' | 'draft-07';
};

const createAjv = (options: NonNullable<Options>, target: NonNullable<VovkAjvConfig['target']>) => {
  const AjvClass = target === 'draft-2020-12' ? Ajv2020 : Ajv;
  const ajv = new AjvClass({ allErrors: true, ...options });
  ajvFormats(ajv);
  ajvErrors(ajv);
  ajv.addKeyword('x-isDto');
  ajv.addKeyword('x-isForm');
  ajv.addKeyword('x-tsType');
  return ajv;
};

const validate = ({
  input,
  schema,
  localize = 'en',
  type,
  endpoint,
  options,
  target,
}: {
  input: unknown;
  schema: VovkBasicJSONSchema;
  localize: Lang;
  type: 'body' | 'query' | 'params';
  endpoint: string;
  options: VovkAjvConfig['options'] | undefined;
  target: VovkAjvConfig['target'] | undefined;
}) => {
  if (input && schema) {
    const schemaTarget = schema.$schema?.includes('://json-schema.org/draft-07/schema') ? 'draft-07' : 'draft-2020-12';
    const ajv = createAjv(options ?? {}, target ?? schemaTarget);
    const isFormData = input instanceof FormData;
    if (input instanceof FormData) {
      const formDataEntries = Array.from(input.entries());
      const result: Record<string, KnownAny> = {};

      formDataEntries.forEach(([key, value]) => {
        // Process the value (handle Blobs/Files)
        let processedValue: KnownAny;
        if (value instanceof Blob) {
          processedValue = '<binary>';
        } else if (Array.isArray(value)) {
          processedValue = value.map((item) => (item instanceof Blob ? '<binary>' : item));
        } else {
          processedValue = value;
        }

        // Handle duplicate keys
        if (key in result) {
          // If the key already exists
          if (Array.isArray(result[key])) {
            // If it's already an array, push to it
            result[key].push(processedValue);
          } else {
            // If it's not an array yet, convert it to an array with both values
            result[key] = [result[key], processedValue];
          }
        } else {
          // First occurrence of this key
          result[key] = processedValue;
        }
      });

      input = result;
    }
    const isValid = ajv.validate(schema, input);
    if (!isValid) {
      ajvLocalize[localize](ajv.errors);
      throw new HttpException(
        HttpStatus.NULL,
        `Ajv validation failed. Invalid ${isFormData ? 'form' : type} on client: ${ajv.errorsText()}`,
        { input, errors: ajv.errors, endpoint }
      );
    }
  }
};

const getConfig = (schema: VovkSchema) => {
  const config = schema.meta?.config?.libs?.ajv as VovkAjvConfig | undefined;

  const options = config?.options ?? {};
  const localize = config?.localize ?? 'en';
  const target = config?.target;

  return { options, localize, target };
};

const validateOnClientAjv = createValidateOnClient({
  validate: (input, schema, { endpoint, type, fullSchema }) => {
    const { options, localize, target } = getConfig(fullSchema);

    validate({
      input,
      schema,
      target,
      localize,
      endpoint,
      options,
      type,
    });
  },
});

const configure = ({
  options: givenOptions,
  localize: givenLocalize,
  target: givenTarget,
}: VovkAjvConfig): VovkValidateOnClient<unknown> =>
  createValidateOnClient({
    validate: (input, schema, { endpoint, type, fullSchema }) => {
      const { options, localize, target } = getConfig(fullSchema);

      validate({
        input,
        schema,
        target: givenTarget ?? target,
        localize: givenLocalize ?? localize,
        endpoint,
        options: givenOptions ?? options,
        type,
      });
    },
  });

export const validateOnClient = Object.assign(validateOnClientAjv, {
  configure,
});
