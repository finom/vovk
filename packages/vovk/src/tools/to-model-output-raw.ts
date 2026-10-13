import { HttpException } from '../core/http-exception.js';
import { HttpStatus } from '../types/enums.js';
import type { VovkRequest } from '../types/request.js';
import type { StandardToolV0 } from '../types/standard-tool.js';
import { responseErrorMessage, toModelErrorMessage } from './to-model-error-message.js';
import { responseToData } from './to-model-output-default.js';

export type ToModelOutputRawFn = <TInput, TOutput>(
  result: TOutput | Error,
  tool: StandardToolV0<TInput, TOutput, unknown>,
  req: Pick<VovkRequest, 'vovk'> | null
) => Promise<TOutput>;

// The result as the procedure gives it. A failed call comes back as its error, which the derived tool throws;
// in production an internal error's message stays on the server, as with the other outputs.
export const toModelOutputRaw: ToModelOutputRawFn = async <TInput, TOutput>(
  result: TOutput | Error,
  _tool: StandardToolV0<TInput, TOutput, unknown>,
  _req: Pick<VovkRequest, 'vovk'> | null
): Promise<TOutput> => {
  if (result instanceof Error) {
    const message = toModelErrorMessage(result);
    return (message === result.message
      ? result
      : new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, message)) as unknown as TOutput;
  }
  if (result instanceof Response) {
    return (
      result.ok ? await responseToData(result) : new HttpException(result.status, await responseErrorMessage(result))
    ) as TOutput;
  }
  return result;
};
