import { HttpException } from '../core/HttpException.js';
import type { KnownAny } from '../types/utils.js';
import type { VovkHandlerSchema } from '../types/core.js';

export const DEFAULT_ERROR_MESSAGE = 'Unknown error at defaultHandler';

// Helper function to get a value from an object using dot notation path
const getNestedValue = (obj: Record<string, KnownAny>, path: string): unknown => {
  return path.split('.').reduce((o, key) => (o && typeof o === 'object' ? o[key] : undefined), obj);
};

export const defaultHandler = async ({ response, schema }: { response: Response; schema: VovkHandlerSchema }) => {
  let result: unknown;

  try {
    result = await response.json();
  } catch (e) {
    // handle parsing errors
    throw new HttpException(response.status, (e as Error)?.message ?? DEFAULT_ERROR_MESSAGE);
  }

  if (!response.ok) {
    const errorKey =
      schema.operationObject && 'x-errorMessageKey' in schema.operationObject
        ? (schema.operationObject['x-errorMessageKey'] as string)
        : 'message';
    // handle server errors
    const errorResponse = result as unknown as Record<string, unknown>;
    throw new HttpException(
      response.status,
      (getNestedValue(errorResponse, errorKey) as string) ?? DEFAULT_ERROR_MESSAGE,
      errorResponse?.cause ?? JSON.stringify(result)
    );
  }

  return result;
};
