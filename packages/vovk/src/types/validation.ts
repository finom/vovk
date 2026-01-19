import type { StandardSchemaV1, StandardJSONSchemaV1 } from './standard-schema.js';
import type { KnownAny } from './utils.js';
import type { VovkHandlerSchema, VovkSchema } from './core.js';

export interface CombinedProps<Input = unknown, Output = Input>
  extends StandardSchemaV1.Props<Input, Output>, StandardJSONSchemaV1.Props<Input, Output> {}

/**
 * An interface that combines StandardJSONSchema and StandardSchema.
 * */
export interface CombinedSpec<Input = unknown, Output = Input> {
  '~standard': CombinedProps<Input, Output>;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CombinedSpec {
  export type Target = StandardJSONSchemaV1.Target;
  export type InferInput<T extends StandardSchemaV1> = StandardSchemaV1.InferInput<T>;
  export type InferOutput<T extends StandardSchemaV1> = StandardSchemaV1.InferOutput<T>;
  export type SuccessResult<T> = StandardSchemaV1.SuccessResult<T>;
}

export type VovkTypedProcedure<
  T extends (...args: KnownAny[]) => unknown,
  B = unknown,
  Q = unknown,
  P = unknown,
  O = unknown,
  I = unknown,
  TIsForm extends boolean = false,
> = T & {
  __types: {
    body: B;
    query: Q;
    params: P;
    output: O;
    iteration: I;
    isForm: TIsForm;
  };
  isRPC?: boolean;
};

/**
 * Client-side validation function type.
 * @see https://vovk.dev/imports
 */
export type VovkValidateOnClient<TFetcherOptions> = (
  input: { body?: unknown; query?: unknown; params?: unknown; meta?: unknown } & TFetcherOptions,
  validation: Omit<Exclude<VovkHandlerSchema['validation'], undefined>, 'output' | 'iteration'>,
  meta: { fullSchema: VovkSchema; endpoint: string }
) => KnownAny | Promise<KnownAny>;
