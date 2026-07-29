import type { VovkJSONSchemaBase } from './json-schema.js';
import type { VovkRequest } from './request.js';
import type { StandardToolV0 } from './standard-tool.js';
import type { KnownAny } from './utils.js';
import type { CombinedSpec } from './validation.js';

export type ToModelOutputFn<TInput, TOutput, TFormattedOutput> = (
  result: TOutput | Error,
  tool: VovkTool<TInput, TOutput, unknown>,
  req: Pick<VovkRequest, 'vovk'> | null
) => TFormattedOutput | Promise<TFormattedOutput>;

/**
 * Vovk tool, produced by both `deriveTools` and `createTool`; extends the {@link StandardToolV0}
 * convention with Vovk specifics (`parameters`, `type`). @see https://vovk.dev/tools
 */
export interface VovkTool<TInput = KnownAny, TOutput = KnownAny, TFormattedOutput = KnownAny>
  extends StandardToolV0<TInput, TOutput, TFormattedOutput> {
  title: string | undefined;
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
   * Per-slot Standard Schemas, only set for procedure-derived tools.
   * @deprecated Use {@link VovkTool.inputSchema} instead, removed in the next major.
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
