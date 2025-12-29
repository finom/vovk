import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { VovkJSONSchemaBase, VovkRequest } from '../types';

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
  inputSchema: TIsDerived extends true ? undefined : TInput extends undefined ? undefined : StandardSchemaV1<TInput>;
  // if derived, output schema is output metod validation or undefined
  outputSchema: TIsDerived extends true
    ? StandardSchemaV1 | undefined
    : TOutput extends undefined
      ? undefined
      : StandardSchemaV1<TOutput>;
  // set only if derived
  inputSchemas: TIsDerived extends true
    ? {
        body?: StandardSchemaV1;
        query?: StandardSchemaV1;
        params?: StandardSchemaV1;
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

export type VovkTool<TInput = unknown, TOutput = unknown, TFormattedOutput = unknown> =
  | VovkToolDerived<TInput, TOutput, TFormattedOutput>
  | VovkToolNonDerived<TInput, TOutput, TFormattedOutput>;

export type VovkToolOptions = {
  hidden?: boolean;
  name?: string;
  title?: string;
  description?: string;
};
