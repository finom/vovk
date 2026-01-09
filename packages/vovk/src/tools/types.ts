import type { VovkJSONSchemaBase, VovkRequest } from '../types';
import { CombinedSpec } from '../validation/types';

type KnownAny = any; // eslint-disable-line @typescript-eslint/no-explicit-any

export type ToModelOutputFn<TInput, TOutput, TFormattedOutput> = (
  result: TOutput | Error,
  tool: VovkTool<TInput, TOutput, unknown>,
  req: Pick<VovkRequest, 'vovk'> | null
) => TFormattedOutput | Promise<TFormattedOutput>;

interface VovkToolCommon<
  TInput = unknown,
  TOutput = unknown,
  TFormattedOutput = unknown,
  TIsDerived extends boolean = boolean,
> {
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
  // if derived, input schema is undefined
  inputSchema: TIsDerived extends true ? undefined : TInput extends undefined ? undefined : CombinedSpec<TInput>;
  // if derived, output schema is output metod validation or undefined
  outputSchema: TIsDerived extends true
    ? CombinedSpec | undefined
    : TOutput extends undefined
      ? undefined
      : CombinedSpec<TOutput>;
  // set only if derived
  inputSchemas: TIsDerived extends true
    ? {
        body?: CombinedSpec;
        query?: CombinedSpec;
        params?: CombinedSpec;
      }
    : undefined;
  type: 'function';
}

export type VovkToolDerived<TInput, TOutput, TFormattedOutput> = VovkToolCommon<
  TInput,
  TOutput,
  TFormattedOutput,
  true
>;
export type VovkToolNonDerived<TInput, TOutput, TFormattedOutput> = VovkToolCommon<
  TInput,
  TOutput,
  TFormattedOutput,
  false
>;

/**
 * Vovk tool type, which can be either derived or non-derived.
 * @see https://vovk.dev/tools
 */
export type VovkTool<TInput = KnownAny, TOutput = KnownAny, TFormattedOutput = KnownAny> =
  | VovkToolDerived<TInput, TOutput, TFormattedOutput>
  | VovkToolNonDerived<TInput, TOutput, TFormattedOutput>;

export type VovkToolOptions = {
  hidden?: boolean;
  name?: string;
  title?: string;
  description?: string;
};
