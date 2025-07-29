import { validate } from 'class-validator';
import type { ClassConstructor } from 'class-transformer';
import { HttpException, HttpStatus, type VovkValidateOnClient } from 'vovk';

const canValidate = (inputObject: unknown, validationSchema: unknown): inputObject is ClassConstructor<object> => {
  return (
    !!inputObject &&
    typeof inputObject === 'object' &&
    inputObject?.constructor !== Object &&
    !(inputObject instanceof FormData) &&
    !!validationSchema &&
    typeof validationSchema === 'object' &&
    'x-isDto' in validationSchema
  );
};

export const validateOnClient: VovkValidateOnClient = async (input, validation) => {
  if (canValidate(input.body, validation.body)) {
    const bodyErrors = await validate(input.body);
    if (bodyErrors.length > 0) {
      const err = bodyErrors.map((e) => Object.values(e.constraints || {}).join(', ')).join(', ');
      throw new HttpException(HttpStatus.NULL, `DTO validation failed. Invalid body on client: ${err}`, {
        body: input.body,
        validationErrors: bodyErrors,
        endpoint: input.endpoint,
      });
    }
  }

  if (canValidate(input.query, validation.query)) {
    const queryErrors = await validate(input.query);
    if (queryErrors.length > 0) {
      const err = queryErrors.map((e) => Object.values(e.constraints || {}).join(', ')).join(', ');
      throw new HttpException(HttpStatus.NULL, `DTO validation failed. Invalid query on client: ${err}`, {
        query: input.query,
        validationErrors: queryErrors,
        endpoint: input.endpoint,
      });
    }
  }

  if (canValidate(input.params, validation.params)) {
    const paramsErrors = await validate(input.params);
    if (paramsErrors.length > 0) {
      const err = paramsErrors.map((e) => Object.values(e.constraints || {}).join(', ')).join(', ');
      throw new HttpException(HttpStatus.NULL, `DTO validation failed. Invalid params on client: ${err}`, {
        params: input.params,
        validationErrors: paramsErrors,
        endpoint: input.endpoint,
      });
    }
  }
};
