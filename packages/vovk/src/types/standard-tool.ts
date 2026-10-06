import type { StandardJSONSchemaV1, StandardSchemaV1 } from './standard-schema.js';

// a copy of the published standard-tool type, with no dependency; keep the two identical
/**
 * A tool in the Standard Tool shape (https://standard-tool.js.org). `deriveTools` returns these.
 * @see https://vovk.dev/tools
 */
export interface StandardToolV0<Input = unknown, Output = unknown, FormattedOutput = Output, Context = unknown> {
  name: string;
  title?: string;
  description: string;
  inputSchema?: StandardSchemaV1<Input> & StandardJSONSchemaV1<Input>;
  outputSchema?: StandardSchemaV1<Output> & StandardJSONSchemaV1<Output>;
  meta?: Record<string, unknown>;
  execute(input: Input, context?: Context): FormattedOutput | Promise<FormattedOutput>;
}
