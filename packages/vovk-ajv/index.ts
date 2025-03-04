import Ajv, { Options } from 'ajv';
import { HttpException, HttpStatus, KnownAny, VovkFullSchema, type VovkValidateOnClient } from 'vovk';
import ajvFormats from 'ajv-formats';
import ajvLocalize from 'ajv-i18n';
import ajvErrors from 'ajv-errors';

type Lang = keyof typeof ajvLocalize;

export type VovkAjvConfig = {
  options?: Options;
  localize?: Lang;
};

const createAjv = (options: Options) => {
  const ajv = new Ajv({ allErrors: true, ...options });
  ajvFormats(ajv);
  ajvErrors(ajv);
  ajv.addKeyword('x-isDto');
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
  schema: Parameters<VovkValidateOnClient>[1];
  ajv: Ajv;
  localize: Lang;
  type: 'body' | 'query' | 'params';
  endpoint: string;
}) => {
  if (data && schema) {
    const isValid = ajv.validate(schema, data);

    if (!isValid) {
      ajvLocalize[localize](ajv.errors);
      throw new HttpException(
        HttpStatus.NULL,
        `Ajv validation failed. Invalid ${type} on client for ${endpoint}. ${ajv.errorsText()}`,
        { data, errors: ajv.errors }
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

const getConfig = (fullSchema: VovkFullSchema) => {
  const config = fullSchema.config.libs?.ajv as VovkAjvConfig | undefined;

  const options = config?.options || {};
  const localize = config?.localize || 'en';

  return { options, localize };
};

let ajvScope: Ajv | null = null;

const validateOnClientAjv: VovkValidateOnClient = (input, validation, fullSchema) => {
  const { options, localize } = getConfig(fullSchema);

  if (!ajvScope) {
    ajvScope = createAjv(options);
  }

  return validateAll({ input, validation, ajv: ajvScope, localize });
};

const configure =
  ({ options: givenOptions, localize: givenLocalize }: VovkAjvConfig): VovkValidateOnClient =>
  (input, validation, fullSchema) => {
    const { options, localize } = getConfig(fullSchema);
    const ajv = createAjv({ ...options, ...givenOptions });

    validateAll({
      input,
      validation,
      ajv,
      localize: givenLocalize || localize,
    });
  };

export const validateOnClient: typeof validateOnClientAjv & { configure: typeof configure } = Object.assign(
  validateOnClientAjv,
  {
    configure,
  }
);
