import type { StandardSchemaV1, StandardJSONSchemaV1 } from './standard-schema.js';
import type { KnownAny } from './utils.js';
import type { VovkHandlerSchema, VovkSchema } from './core.js';
import type { textTypes } from '../req/parseBody.js';

export interface CombinedProps<Input = unknown, Output = Input>
  extends StandardSchemaV1.Props<Input, Output>, StandardJSONSchemaV1.Props<Input, Output> {}

/**
 * An interface that combines StandardJSONSchema and StandardSchema.
 * */
export interface CombinedSpec<Input = unknown, Output = Input> {
  '~standard': CombinedProps<Input, Output>;
}

/** Application MIME types that are parsed as text (derived from parseBody.ts textTypes). */
type TextLikeApplicationType = (typeof textTypes)[number];

export type ContentType =
  | 'application/json'
  | 'multipart/form-data'
  | 'application/x-www-form-urlencoded'
  | 'text/plain'
  | 'application/octet-stream'
  | TextLikeApplicationType
  | `text/${string}`
  | `application/${string}`
  | (string & {});

export type NormalizeContentType<T extends ContentType | ContentType[]> = T extends ContentType[] ? T : [T & ContentType];

export type BodyTypeFromContentType<T extends ContentType[], TBody> = T[number] extends infer A
  ? A extends 'application/json' | `${string}+json`
    ? TBody | Blob
    : A extends 'multipart/form-data'
      ? FormData | Blob
      : A extends 'application/x-www-form-urlencoded'
        ? URLSearchParams | FormData | Blob
        : A extends
              | `text/${string}`
              | TextLikeApplicationType
              | `${string}+xml`
              | `${string}+text`
              | `${string}+yaml`
              | `${string}+json-seq`
          ? string | Blob
          : File | ArrayBuffer | Uint8Array | Blob
  : never;

export type VovkTypedProcedure<
  T extends (...args: KnownAny[]) => unknown,
  B = unknown,
  Q = unknown,
  P = unknown,
  O = unknown,
  I = unknown,
  TContentType extends ContentType | ContentType[] = ['application/json'],
> = T & {
  __types: {
    body: B;
    query: Q;
    params: P;
    output: O;
    iteration: I;
    contentType: NormalizeContentType<TContentType>;
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
