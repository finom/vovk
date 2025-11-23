import type { VovkValidateOnClient } from '../client';
import type { KnownAny, VovkJSONSchemaBase } from '../types';

export function createValidateOnClient<TFetcherOptions>({
  validate,
}: {
  validate: (
    input: unknown,
    schema: VovkJSONSchemaBase,
    meta: Parameters<VovkValidateOnClient<TFetcherOptions>>[2] & { type: 'body' | 'query' | 'params' }
  ) => KnownAny | Promise<KnownAny>;
}): VovkValidateOnClient<TFetcherOptions> {
  const validateOnClient = async function validateOnClient(input, validation, meta) {
    const newInput = { ...input };
    if (input.body && validation.body) {
      newInput.body = (await validate(input.body, validation.body, { ...meta, type: 'body' })) ?? input.body;
    }

    if (input.query && validation.query) {
      newInput.query = (await validate(input.query, validation.query, { ...meta, type: 'query' })) ?? input.query;
    }

    if (input.params && validation.params) {
      newInput.params = (await validate(input.params, validation.params, { ...meta, type: 'params' })) ?? input.params;
    }

    return newInput;
  } satisfies VovkValidateOnClient<TFetcherOptions>;

  return validateOnClient;
}
