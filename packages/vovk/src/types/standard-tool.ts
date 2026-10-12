import type { StandardJSONSchemaV1, StandardSchemaV1 } from './standard-schema.js';

// standard-tool's StandardToolV0, copied as its README describes; keep it identical (a type test checks)
// Portable LLM tool. Schemas may transform: `Input` is the input schema's input side, `Output` the output schema's output side.
export interface StandardToolV0<Input = unknown, Output = unknown, FormattedOutput = Output, Context = unknown> {
  name: string;
  title?: string;
  description: string;
  inputSchema?: StandardSchemaV1<Input, unknown> & StandardJSONSchemaV1<Input, unknown>;
  outputSchema?: StandardSchemaV1<unknown, Output> & StandardJSONSchemaV1<unknown, Output>;
  meta?: Record<string, unknown>;
  execute(input: Input, context?: Context): FormattedOutput | Promise<FormattedOutput>;
}
