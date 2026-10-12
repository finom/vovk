import type { StandardJSONSchemaV1, StandardSchemaV1 } from './standard-schema.js';

// standard-tool's StandardToolV0 with each schema's input and output sides equal, as derived tools have them; it is
// assignable to the published type, which users import from standard-tool, so it is not exported
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
