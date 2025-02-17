import Ajv, { Options } from 'ajv';
import { HttpException, HttpStatus, VovkFullSchema, type VovkValidateOnClient } from 'vovk';
import addFormats from 'ajv-formats';
import ajvLocalize from 'ajv-i18n';

type Lang = keyof typeof ajvLocalize;

export type VovkAjvConfig = {
  options?: Options;
  localize?: Lang;
};

const validate = ({
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
  if (validation.body) {
    const isValid = ajv.validate(validation.body, input.body);

    if (!isValid) {
      ajvLocalize[localize](ajv.errors);
      throw new HttpException(
        HttpStatus.NULL,
        `Ajv validation failed. Invalid request body on client for ${input.endpoint}. ${ajv.errorsText()}`,
        { body: input.body, endpoint: input.endpoint, errors: ajv.errors }
      );
    }
  }

  if (validation.query) {
    const isValid = ajv.validate(validation.query, input.query);

    if (!isValid) {
      ajvLocalize[localize](ajv.errors);
      throw new HttpException(
        HttpStatus.NULL,
        `Ajv validation failed. Invalid request query on client for ${input.endpoint}. ${ajv.errorsText()}`,
        { query: input.query, endpoint: input.endpoint, errors: ajv.errors }
      );
    }
  }

  if (validation.params) {
    const isValid = ajv.validate(validation.params, input.params);

    if (!isValid) {
      ajvLocalize[localize](ajv.errors);
      throw new HttpException(
        HttpStatus.NULL,
        `Ajv validation failed. Invalid request params on client for ${input.endpoint}. ${ajv.errorsText()}`,
        { params: input.params, endpoint: input.endpoint, errors: ajv.errors }
      );
    }
  }
};

const getConfig = (fullSchema: VovkFullSchema) => {
  const config = fullSchema.config.custom?.ajv as VovkAjvConfig | undefined;

  const options = config?.options || {};
  const localize = config?.localize || 'en';

  return { options, localize };
};

let ajvScope: Ajv | null = null;

const validateOnClient: VovkValidateOnClient = (input, validation, fullSchema) => {
  const { options, localize } = getConfig(fullSchema);

  if (!ajvScope) {
    ajvScope = new Ajv(options);
    addFormats(ajvScope);
  }

  return validate({ input, validation, ajv: ajvScope, localize });
};

const configure =
  ({ options: givenOptions, localize: givenLocalize }: VovkAjvConfig): VovkValidateOnClient =>
  (input, validation, fullSchema) => {
    const { options, localize } = getConfig(fullSchema);

    const ajv = new Ajv({ ...options, ...givenOptions });
    addFormats(ajv);
    return validate({ input, validation, ajv, localize: givenLocalize || localize });
  };

const validateOnClientAjv: typeof validateOnClient & { configure: typeof configure } = Object.assign(validateOnClient, {
  configure,
});

export default validateOnClientAjv;
