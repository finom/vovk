import { VovkRequest } from '../types.js';
import type { VovkTool } from './types.js';

export type DefaultModelOutput<T> = T | { error: string };

export type ToModelOutputDefaultFn = <TInput, TOutput>(
  result: TOutput | Error,
  tool: VovkTool<TInput, TOutput, unknown>,
  req: Pick<VovkRequest, 'vovk'> | null
) => DefaultModelOutput<TOutput>;

export const toModelOutputDefault: ToModelOutputDefaultFn = <TInput, TOutput>(
  result: TOutput | Error,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _tool: VovkTool<TInput, TOutput, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _req: Pick<VovkRequest, 'vovk'> | null
): DefaultModelOutput<TOutput> => {
  return result instanceof Error ? { error: result.message } : result;
};
