import type { VovkRequest } from '../types/request.js';
import type { StandardToolV0 } from '../types/standard-tool.js';

export type DefaultModelOutput<T> = T | { error: string };

export type ToModelOutputDefaultFn = <TInput, TOutput>(
  result: TOutput | Error,
  tool: StandardToolV0<TInput, TOutput, unknown>,
  req: Pick<VovkRequest, 'vovk'> | null
) => DefaultModelOutput<TOutput>;

export const toModelOutputDefault: ToModelOutputDefaultFn = <TInput, TOutput>(
  result: TOutput | Error,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _tool: StandardToolV0<TInput, TOutput, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _req: Pick<VovkRequest, 'vovk'> | null
): DefaultModelOutput<TOutput> => {
  return result instanceof Error ? { error: result.message } : result;
};
