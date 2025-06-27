import { Ajv, Options } from 'ajv';
import Ajv2020 from 'ajv/dist/2020';
import ajvFormats from 'ajv-formats';
import ajvLocalize from 'ajv-i18n';
import ajvErrors from 'ajv-errors';
import { HttpException, HttpStatus, type KnownAny, type VovkSchema, type VovkValidateOnClient } from 'vovk';

type Lang = keyof typeof ajvLocalize;

export type VovkAjvConfig = {
  options?: Options;
  localize?: Lang;
  target?: 'draft-2020-12' | 'draft-07';
};

const createAjv = (options: Options, target: VovkAjvConfig['target']) => {
  // TODO auto-detect by https://json-schema.org/draft-07/schema, https://json-schema.org/draft/2020-12/schema
  const AjvClass = target === 'draft-2020-12' ? Ajv2020 : Ajv;
  const ajv = new AjvClass({ allErrors: true, ...options });
  ajvFormats(ajv);
  ajvErrors(ajv);
  ajv.addKeyword('x-isDto');
  ajv.addKeyword('x-formData');
  return ajv;
};

const validate = ({
  data,
  schema,
  ajv,
  localize = 'en',
  type,
  endpoint,
}: {
  data: KnownAny;
  schema: Parameters<VovkValidateOnClient>[1]['body' | 'query' | 'params'];
  ajv: Ajv;
  localize: Lang;
  type: 'body' | 'query' | 'params';
  endpoint: string;
}) => {
  if (data && schema) {
    const isForm = data instanceof FormData && schema['x-formData'];
    if (isForm) {
      data = Object.fromEntries(
        data.entries().map(([key, value]: [KnownAny, KnownAny]) => {
          if (value instanceof File) {
            return [key, 'File<' + value.name + '>'];
          }
          return [key, value];
        })
      );
    }
    const isValid = ajv.validate(schema, data);
    if (!isValid) {
      ajvLocalize[localize](ajv.errors);
      throw new HttpException(
        HttpStatus.NULL,
        `Ajv validation failed. Invalid ${isForm ? 'form' : type} on client: ${ajv.errorsText()}`,
        { data, errors: ajv.errors, endpoint }
      );
    }
  }
};

const validateAll = ({
  input,
  validation,
  ajv,
  localize = 'en',
}: {
  input: Parameters<VovkValidateOnClient>[0];
  validation: Parameters<VovkValidateOnClient>[1];
  ajv: Ajv;
  localize: Lang;
}) => {
  validate({ data: input.body, schema: validation.body, ajv, localize, endpoint: input.endpoint, type: 'body' });
  validate({ data: input.query, schema: validation.query, ajv, localize, endpoint: input.endpoint, type: 'query' });
  validate({ data: input.params, schema: validation.params, ajv, localize, endpoint: input.endpoint, type: 'params' });
};

const getConfig = (schema: VovkSchema) => {
  const config = schema.meta.config?.libs?.ajv as VovkAjvConfig | undefined;

  const options = config?.options ?? {};
  const localize = config?.localize ?? 'en';
  const target = config?.target ?? 'draft-2020-12';

  return { options, localize, target };
};

let ajvScope: Ajv | null = null;

const validateOnClientAjv: VovkValidateOnClient = (input, validation, schema) => {
  const { options, localize, target } = getConfig(schema);

  if (!ajvScope) {
    ajvScope = createAjv(options, target);
  }

  return validateAll({ input, validation, ajv: ajvScope, localize });
};

const configure =
  ({ options: givenOptions, localize: givenLocalize, target: givenTarget }: VovkAjvConfig): VovkValidateOnClient =>
  (input, validation, schema) => {
    const { options, localize, target } = getConfig(schema);
    const ajv = createAjv({ ...options, ...givenOptions }, givenTarget ?? target);

    validateAll({
      input,
      validation,
      ajv,
      localize: givenLocalize ?? localize,
    });
  };

export const validateOnClient: typeof validateOnClientAjv & { configure: typeof configure } = Object.assign(
  validateOnClientAjv,
  {
    configure,
  }
);
