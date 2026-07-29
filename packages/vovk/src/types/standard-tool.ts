import type { StandardJSONSchemaV1, StandardSchemaV1 } from './standard-schema.js';

/**
 * The `standard-tool` convention (https://standard-tool.js.org): a neutral LLM tool shape —
 * `name`, `title`, `description`, optional `inputSchema`/`outputSchema`, `execute`. Vendored as a
 * type only (no logic, no dependency) so `VovkTool` can extend it at zero cost. Kept byte-identical
 * to the `StandardToolV0` interface published by `standard-tool`; update it here when that changes.
 */
export interface StandardToolV0<Input = unknown, Output = unknown, FormattedOutput = Output, Meta = unknown> {
  name: string;
  title?: string;
  description: string;
  inputSchema?: StandardSchemaV1<Input> & StandardJSONSchemaV1<Input>;
  outputSchema?: StandardSchemaV1<Output> & StandardJSONSchemaV1<Output>;
  execute(input: Input, meta?: Meta): FormattedOutput | Promise<FormattedOutput>;
}
