import type { KnownAny } from './utils.js';
import type { CombinedSpec } from './validation.js';

/**
 * The `standard-tool` convention (https://github.com/finom/standard-tool): a neutral LLM tool shape —
 * `name`, `description`, optional `inputSchema`/`outputSchema`, `execute`. Vendored as a type only
 * (no logic) so `VovkTool` can extend it with zero added dependencies. Kept identical to the
 * `StandardTool` type published by `standard-tool` (`meta` is `KnownAny`, i.e. its `any`).
 */
export interface StandardTool<Input = unknown, Output = unknown, FormattedOutput = Output | { error: string }> {
  name: string;
  description: string;
  inputSchema?: CombinedSpec<Input>;
  outputSchema?: CombinedSpec<Output>;
  execute(input: Input, meta?: KnownAny): FormattedOutput | Promise<FormattedOutput>;
}
