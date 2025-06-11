import { validate } from 'class-validator';
import type { ClassConstructor } from 'class-transformer';
import { HttpException, HttpStatus, type VovkValidateOnClient } from 'vovk';

export const validateOnClient: VovkValidateOnClient = async (input, validation) => {
  if (validation.body && 'x-isDto' in (validation.body as object)) {
    const bodyErrors = await validate(input.body as ClassConstructor<object>);
    if (bodyErrors.length > 0) {
      const err = bodyErrors.map((e) => Object.values(e.constraints || {}).join(', ')).join(', ');
      throw new HttpException(HttpStatus.NULL, `DTO validation failed. Invalid body on client: ${err}`, {
        body: input.body,
        validationErrors: bodyErrors,
        endpoint: input.endpoint,
      });
    }
  }

  if (validation.query && 'x-isDto' in (validation.query as object)) {
    const queryErrors = await validate(input.query as ClassConstructor<object>);
    if (queryErrors.length > 0) {
      const err = queryErrors.map((e) => Object.values(e.constraints || {}).join(', ')).join(', ');
      throw new HttpException(HttpStatus.NULL, `DTO validation failed. Invalid query on client: ${err}`, {
        query: input.query,
        validationErrors: queryErrors,
        endpoint: input.endpoint,
      });
    }
  }

  if (validation.params && 'x-isDto' in (validation.params as object)) {
    const paramsErrors = await validate(input.params as ClassConstructor<object>);
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
