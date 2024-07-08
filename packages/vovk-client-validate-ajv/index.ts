import Ajv from 'ajv';
import { HttpException, HttpStatus, VovkValidateOnClient } from 'vovk';
import addFormats from 'ajv-formats';

const ajv = new Ajv();

addFormats(ajv);

const validateOnClientAjv: VovkValidateOnClient = (input, validators) => {
  if (validators.body) {
    const isValid = ajv.validate(validators.body, input.body);

    if (!isValid) {
      throw new HttpException(
        HttpStatus.NULL,
        `Invalid request body on client for ${input.endpoint}. ${ajv.errorsText()}`,
        { body: input.body }
      );
    }
  }

  if (validators.query) {
    const isValid = ajv.validate(validators.query, input.query);

    if (!isValid) {
      throw new HttpException(
        HttpStatus.NULL,
        `Invalid request query on client for ${input.endpoint}. ${ajv.errorsText()}`,
        { query: input.query }
      );
    }
  }
};

export default validateOnClientAjv;
