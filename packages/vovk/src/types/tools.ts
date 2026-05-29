import type { VovkJSONSchemaBase } from './json-schema.js';
import type { VovkRequest } from './request.js';
import type { CombinedSpec } from './validation.js';
import type { StandardTool } from './standard-tool.js';
import type { KnownAny } from './utils.js';

export type ToModelOutputFn<TInput, TOutput, TFormattedOutput> = (
  result: TOutput | Error,
  tool: VovkTool<TInput, TOutput, unknown>,
  req: Pick<VovkRequest, 'vovk'> | null
) => TFormattedOutput | Promise<TFormattedOutput>;

/**
 * Vovk tool — produced by both `deriveTools` (procedures → tools) and
 * `createTool` (standalone tools); both return the same shape. Extends the
 * {@link StandardTool} convention with Vovk specifics (`title`, `parameters`, `type`).
 * @see https://vovk.dev/tools
 */
export interface VovkTool<TInput = KnownAny, TOutput = KnownAny, TFormattedOutput = KnownAny>
  extends StandardTool<TInput, TOutput, TFormattedOutput> {
  execute: (input: TInput, options?: unknown) => TFormattedOutput | Promise<TFormattedOutput>;
  name: string;
  title: string | undefined;
  description: string;
  parameters: {
    type?: 'object';
    properties?: {
      body?: VovkJSONSchemaBase;
      query?: VovkJSONSchemaBase;
      params?: VovkJSONSchemaBase;
    };
    required?: ('body' | 'query' | 'params')[];
    additionalProperties?: false;
  };
  inputSchema: TInput extends undefined ? undefined : CombinedSpec<TInput>;
  outputSchema: TOutput extends undefined ? undefined : CombinedSpec<TOutput>;
  /**
   * Per-slot Standard Schemas, populated only when the tool was built via
   * `deriveTools` from a procedure. Always `undefined` for tools built via
   * `createTool`.
   *
   * @deprecated Use {@link VovkTool.inputSchema} (a merged Standard Schema)
   * instead. This field will be removed in the next major version.
   */
  inputSchemas?: {
    body?: CombinedSpec;
    query?: CombinedSpec;
    params?: CombinedSpec;
  };
  type: 'function';
}

export type VovkToolOptions = {
  hidden?: boolean;
  name?: string;
  title?: string;
  description?: string;
};
