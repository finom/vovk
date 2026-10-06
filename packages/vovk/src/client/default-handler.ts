import { HttpException } from '../core/http-exception.js';
import type { VovkHandlerSchema } from '../types/core.js';
import type { KnownAny } from '../types/utils.js';

export const DEFAULT_ERROR_MESSAGE = 'Unknown error at defaultHandler';

const getNestedValue = (obj: Record<string, KnownAny>, path: string): unknown => {
  return path.split('.').reduce((o, key) => (o && typeof o === 'object' ? o[key] : undefined), obj);
};

export const defaultHandler = async ({ response, schema }: { response: Response; schema: VovkHandlerSchema }) => {
  let result: unknown;

  try {
    // HEAD answers, 204, 205 and 304 have no body, and one sent chunked may have no bytes and no length either
    const text = response.body === null ? '' : await response.text();
    result = text === '' ? null : JSON.parse(text);
  } catch (e) {
    throw new HttpException(response.status, (e as Error)?.message ?? DEFAULT_ERROR_MESSAGE);
  }

  if (!response.ok) {
    const errorKey =
      schema.operationObject && 'x-errorMessageKey' in schema.operationObject
        ? (schema.operationObject['x-errorMessageKey'] as string)
        : 'message';
    const errorResponse = (result ?? {}) as Record<string, unknown>;
    // a problem details document (RFC 9457) has no message, its detail or title says what went wrong
    const message = getNestedValue(errorResponse, errorKey) ?? errorResponse.detail ?? errorResponse.title;
    throw new HttpException(
      response.status,
      (message as string) ?? DEFAULT_ERROR_MESSAGE,
      errorResponse.cause ?? JSON.stringify(result)
    );
  }

  return result;
};
