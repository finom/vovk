import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { VovkHandlerSchema, VovkJSONSchemaBase, VovkRequest } from '../types';

export type ToModelOutputFn<TOutput, TFormattedOutput> = (
  result: TOutput | Error,
  options: {
    toolOptions: VovkToolOptions;
    handlerSchema: VovkHandlerSchema | null;
    req: Pick<VovkRequest, 'vovk'> | null;
  }
) => TFormattedOutput | Promise<TFormattedOutput>;

export interface VovkTool<
  TInput = unknown,
  TOutput = unknown,
  TFormattedOutput = unknown,
  TIsDerived extends boolean = false,
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

export type VovkToolOptions = {
  hidden?: boolean;
  name?: string;
  title?: string;
  description?: string;
};
