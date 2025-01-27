import * as Yup from 'yup';
import { buildYup } from 'schema-to-yup';
import { HttpException, HttpStatus, VovkValidateOnClient } from 'vovk';

const validateOnClientYup: VovkValidateOnClient = async (input, validators) => {
  if (validators.body) {
    try {
      await buildYup(validators.body).validate(input.body);
    } catch (e) {
      const err = (e as Yup.ValidationError).errors.join(', ');
      throw new HttpException(
        HttpStatus.NULL,
        `Yup validation failed. Invalid request body on client for ${input.endpoint}. ${err}`,
        {
          body: input.body,
          originalCause: e,
          endpoint: input.endpoint,
        }
      );
    }
  }

  if (validators.query) {
    try {
      await buildYup(validators.query).validate(input.query);
    } catch (e) {
      const err = (e as Yup.ValidationError).errors.join(', ');
      throw new HttpException(
        HttpStatus.NULL,
        `Yup validation failed. Invalid request query on client for ${input.endpoint}. ${err}`,
        {
          query: input.query,
          originalCause: e,
          endpoint: input.endpoint,
        }
      );
    }
  }
};

export default validateOnClientYup;
