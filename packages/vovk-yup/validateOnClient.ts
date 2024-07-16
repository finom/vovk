import * as Yup from 'yup';
import { buildYup } from 'schema-to-yup';
import { HttpException, HttpStatus, VovkValidateOnClient } from 'vovk';

const validateOnClientYup: VovkValidateOnClient = (input, validators) => {
  if (validators.body) {
    try {
      buildYup(validators.body).validateSync(input.body);
    } catch (e) {
      const err = (e as Yup.ValidationError).errors.join(', ');
      throw new HttpException(HttpStatus.NULL, `Invalid request body on client for ${input.endpoint}. ${err}`, {
        body: input.body,
      });
    }
  }

  if (validators.query) {
    try {
      buildYup(validators.query).validateSync(input.query);
    } catch (e) {
      const err = (e as Yup.ValidationError).errors.join(', ');
      throw new HttpException(HttpStatus.NULL, `Invalid request query on client for ${input.endpoint}. ${err}`, {
        query: input.query,
      });
    }
  }
};

export default validateOnClientYup;
