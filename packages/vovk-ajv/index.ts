import { Ajv, Options } from 'ajv';
import Ajv2020 from 'ajv/dist/2020';
import ajvFormats from 'ajv-formats';
import ajvLocalize from 'ajv-i18n';
import ajvErrors from 'ajv-errors';
import { HttpException, HttpStatus, KnownAny, type VovkSchema, type VovkValidateOnClient } from 'vovk';

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
  ajv.addKeyword('x-formData');
  ajv.addKeyword('x-tsType');
  ajv.addFormat('binary', {
    type: 'string',
    validate: (data) => (data as KnownAny) instanceof File || (data as KnownAny) instanceof Blob,
  });
  return ajv;
};

const validate = ({
  data,
  schema,
  localize = 'en',
  type,
  endpoint,
  options,
  target,
}: {
  data: unknown;
  schema: Parameters<VovkValidateOnClient>[1]['body' | 'query' | 'params'];
  localize: Lang;
  type: 'body' | 'query' | 'params';
  endpoint: string;
  options: VovkAjvConfig['options'] | undefined;
  target: VovkAjvConfig['target'] | undefined;
}) => {
  if (data && schema) {
    const schemaTarget = schema.$schema.includes('://json-schema.org/draft-07/schema') ? 'draft-07' : 'draft-2020-12';
    const ajv = createAjv(options ?? {}, target ?? schemaTarget);
    if (data instanceof FormData) {
      data = Object.fromEntries(data.entries());
    }
    const isValid = ajv.validate(schema, data);
    if (!isValid) {
      ajvLocalize[localize](ajv.errors);
      throw new HttpException(
        HttpStatus.NULL,
        `Ajv validation failed. Invalid ${data instanceof FormData ? 'form' : type} on client: ${ajv.errorsText()}`,
        { data, errors: ajv.errors, endpoint }
      );
    }
  }
};

const validateAll = ({
  input,
  validation,
  localize = 'en',
  target,
  options,
}: {
  input: Parameters<VovkValidateOnClient>[0];
  validation: Parameters<VovkValidateOnClient>[1];
  localize: Lang;
  target: VovkAjvConfig['target'] | undefined;
  options: VovkAjvConfig['options'] | undefined;
}) => {
  validate({
    data: input.body,
    schema: validation.body,
    target,
    localize,
    endpoint: input.endpoint,
    options,
    type: 'body',
  });
  validate({
    data: input.query,
    schema: validation.query,
    target,
    localize,
    endpoint: input.endpoint,
    options,
    type: 'query',
  });
  validate({
    data: input.params,
    schema: validation.params,
    target,
    localize,
    endpoint: input.endpoint,
    options,
    type: 'params',
  });
};

const getConfig = (schema: VovkSchema) => {
  const config = schema.meta?.config?.libs?.ajv as VovkAjvConfig | undefined;

  const options = config?.options ?? {};
  const localize = config?.localize ?? 'en';
  const target = config?.target;

  return { options, localize, target };
};

const validateOnClientAjv: VovkValidateOnClient = (input, validation, schema) => {
  const { options, localize, target } = getConfig(schema);

  return validateAll({ input, validation, target, localize, options });
};

const configure =
  ({ options: givenOptions, localize: givenLocalize, target: givenTarget }: VovkAjvConfig): VovkValidateOnClient =>
  (input, validation, schema) => {
    const { options, localize, target } = getConfig(schema);

    validateAll({
      input,
      validation,
      target: givenTarget ?? target,
      localize: givenLocalize ?? localize,
      options: givenOptions ?? options,
    });
  };

export const validateOnClient: typeof validateOnClientAjv & { configure: typeof configure } = Object.assign(
  validateOnClientAjv,
  {
    configure,
  }
);
