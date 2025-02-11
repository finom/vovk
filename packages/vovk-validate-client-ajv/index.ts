import Ajv from 'ajv';
import { HttpException, HttpStatus, type VovkValidateOnClient } from 'vovk';
import addFormats from 'ajv-formats';

const ajv = new Ajv();

addFormats(ajv);

const validateOnClientAjv: VovkValidateOnClient = (input, validation) => {
  if (validation.body) {
    const isValid = ajv.validate(validation.body, input.body);

    if (!isValid) {
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
      throw new HttpException(
        HttpStatus.NULL,
        `Ajv validation failed. Invalid request params on client for ${input.endpoint}. ${ajv.errorsText()}`,
        { params: input.params, endpoint: input.endpoint, errors: ajv.errors }
      );
    }
  }
};

export default validateOnClientAjv;
