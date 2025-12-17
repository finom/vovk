import type { VovkHandlerSchema, VovkToolOptions } from '../types';

export type ToModelOutputFn<TOutput, TFormattedOutput> = (
  result: TOutput | Error,
  options: { toolOptions: VovkToolOptions; handlerSchema: VovkHandlerSchema | null; request: Request | null }
) => TFormattedOutput | Promise<TFormattedOutput>;
