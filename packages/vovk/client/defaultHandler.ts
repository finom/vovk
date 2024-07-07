import { type _VovkErrorResponse as VovkErrorResponse } from '../types';
import { _HttpException as HttpException } from '../HttpException';

export const DEFAULT_ERROR_MESSAGE = 'Unknown error at defaultHandler';

export const _defaultHandler = async (response: Response) => {
  let result: unknown;

  try {
    result = await response.json();
  } catch (e) {
    // handle parsing errors
    throw new HttpException(response.status, (e as Error)?.message ?? DEFAULT_ERROR_MESSAGE);
  }

  if (!response.ok) {
    // handle server errors
    throw new HttpException(response.status, (result as VovkErrorResponse)?.message ?? DEFAULT_ERROR_MESSAGE);
  }

  return result;
};
