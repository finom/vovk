import type { StandardJSONSchemaV1, StandardSchemaV1 } from './standard-schema.js';

/**
 * Vendored `standard-tool` type (https://standard-tool.js.org), no dependency, no logic.
 * Keep it identical to the published `StandardToolV0` interface.
 */
export interface StandardToolV0<Input = unknown, Output = unknown, FormattedOutput = Output, Meta = unknown> {
  name: string;
  title?: string;
  description: string;
  inputSchema?: StandardSchemaV1<Input> & StandardJSONSchemaV1<Input>;
  outputSchema?: StandardSchemaV1<Output> & StandardJSONSchemaV1<Output>;
  execute(input: Input, meta?: Meta): FormattedOutput | Promise<FormattedOutput>;
}
