import type { CombinedSpec } from './validation.js';

/**
 * The `standard-tool` convention (https://github.com/finom/standard-tool): a neutral LLM tool shape —
 * `name`, `description`, optional `inputSchema`/`outputSchema`, `execute`. Vendored as a type only
 * (no logic) so `VovkTool` can extend it with zero added dependencies.
 */
export interface StandardTool<Input, Output, FormattedOutput = Output | { error: string }> {
  name: string;
  description: string;
  inputSchema?: CombinedSpec<Input>;
  outputSchema?: CombinedSpec<Output>;
  execute(input: Input): FormattedOutput | Promise<FormattedOutput>;
}
