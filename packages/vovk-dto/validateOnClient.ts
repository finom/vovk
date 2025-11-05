import { validate } from 'class-validator';
import type { ClassConstructor } from 'class-transformer';
import { createValidateOnClient, HttpException, HttpStatus } from 'vovk';

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

export const validateOnClient = createValidateOnClient({
  validate: async (input, schema, meta) => {
    if (canValidate(input, schema)) {
      const errors = await validate(input, {
        whitelist: true,
        forbidNonWhitelisted: true,
        validationError: { target: false, value: false },
      });
      if (errors.length > 0) {
        const err = errors.map((e) => Object.values(e.constraints || {}).join(', ')).join(', ');
        throw new HttpException(HttpStatus.NULL, `DTO validation failed. Invalid ${meta.type} on client: ${err}`, {
          [meta.type]: input,
          errors,
          endpoint: meta.endpoint,
        });
      }
    }

    return input;
  },
});
