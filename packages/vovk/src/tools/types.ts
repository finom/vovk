import type { VovkHandlerSchema, VovkLLMToolOptions } from '../types';

export type ToModelOutputFn<TOutput, TFormattedOutput> = (
  result: TOutput | Error,
  options: { toolOptions: VovkLLMToolOptions; handlerSchema: VovkHandlerSchema | null; request: Request | null }
) => TFormattedOutput | Promise<TFormattedOutput>;
