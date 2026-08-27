import type { VovkRequest } from './request.js';
import type { StandardToolV0 } from './standard-tool.js';

export type ToModelOutputFn<TInput, TOutput, TFormattedOutput> = (
  result: TOutput | Error,
  tool: StandardToolV0<TInput, TOutput, unknown>,
  req: Pick<VovkRequest, 'vovk'> | null
) => TFormattedOutput | Promise<TFormattedOutput>;

export type VovkToolOptions = {
  hidden?: boolean;
  name?: string;
  title?: string;
  description?: string;
  // static data about the tool, copied to the derived standard tool as is
  meta?: Record<string, unknown>;
};
