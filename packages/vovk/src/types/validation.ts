import type { textTypes } from '../req/parse-body.js';
import type { VovkHandlerSchema, VovkSchema } from './core.js';
import type { StandardJSONSchemaV1, StandardSchemaV1 } from './standard-schema.js';
import type { KnownAny } from './utils.js';

export interface CombinedProps<Input = unknown, Output = Input>
  extends StandardSchemaV1.Props<Input, Output>,
    StandardJSONSchemaV1.Props<Input, Output> {}

/**
 * An interface that combines StandardJSONSchema and StandardSchema.
 * */
export interface CombinedSpec<Input = unknown, Output = Input> {
  '~standard': CombinedProps<Input, Output>;
}

export namespace CombinedSpec {
  export type Target = StandardJSONSchemaV1.Target;
  export type InferInput<T extends StandardSchemaV1> = StandardSchemaV1.InferInput<T>;
  export type InferOutput<T extends StandardSchemaV1> = StandardSchemaV1.InferOutput<T>;
  export type SuccessResult<T> = StandardSchemaV1.SuccessResult<T>;
}

/** The type of a procedure() schema option that is left out. */
export type NoSchema = CombinedSpec & { readonly __noSchema: true };

// the type that says whether an empty value passes a schema: its input, or its output where the input is unknown,
// as with z.preprocess()
type EmptyValueCheck<T extends CombinedSpec> =
  unknown extends CombinedSpec.InferInput<T> ? CombinedSpec.InferOutput<T> : CombinedSpec.InferInput<T>;

/**
 * What a procedure's RPC method takes: a key for each schema, typed with the schema's input and optional when the
 * server accepts a request without it (it validates a missing body as undefined, a missing query or params as {}).
 */
export type ProcedureInput<
  TBody extends CombinedSpec,
  TQuery extends CombinedSpec,
  TParams extends CombinedSpec,
  TContentType extends ContentType[],
> = ([TBody] extends [NoSchema]
  ? // no body schema: a declared content type other than JSON still takes a body
    TContentType[number] extends 'application/json'
    ? unknown
    : { body?: BodyTypeFromContentType<TContentType, unknown> }
  : undefined extends EmptyValueCheck<TBody>
    ? { body?: BodyTypeFromContentType<TContentType, CombinedSpec.InferInput<TBody>> }
    : { body: BodyTypeFromContentType<TContentType, CombinedSpec.InferInput<TBody>> }) &
  ([TQuery] extends [NoSchema]
    ? unknown
    : {} extends EmptyValueCheck<TQuery>
      ? { query?: CombinedSpec.InferInput<TQuery> }
      : { query: CombinedSpec.InferInput<TQuery> }) &
  ([TParams] extends [NoSchema]
    ? // a procedure doesn't know its route, which may have params
      { params?: Record<string, string> }
    : {} extends EmptyValueCheck<TParams>
      ? { params?: CombinedSpec.InferInput<TParams> }
      : { params: CombinedSpec.InferInput<TParams> });

/** What a procedure's fn() takes: what its RPC method takes, and a body or a query its handler reads as given. */
export type ProcedureFnInput<
  TBody extends CombinedSpec,
  TQuery extends CombinedSpec,
  TParams extends CombinedSpec,
  TContentType extends ContentType[],
> = ([TBody] extends [NoSchema] ? { body?: unknown } : unknown) &
  ([TQuery] extends [NoSchema] ? { query?: unknown } : unknown) &
  ProcedureInput<TBody, TQuery, TParams, TContentType>;

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
  | `${string}+json`
  | `${string}+xml`
  | `${string}+text`
  | `${string}+yaml`
  | `${string}+json-seq`
  | '*/*'
  | (string & {});

export type NormalizeContentType<T extends ContentType | ContentType[]> = T extends ContentType[]
  ? T
  : [T & ContentType];

export type BodyTypeFromContentType<T extends ContentType[], TBody> = T[number] extends infer A
  ? A extends '*/*'
    ? TBody | URLSearchParams | FormData | ArrayBuffer | Uint8Array | Blob
    : A extends 'application/json' | `${string}+json`
      ? TBody | Blob
      : A extends 'multipart/form-data'
        ? TBody | FormData | Blob
        : A extends 'application/x-www-form-urlencoded'
          ? TBody | URLSearchParams | FormData | Blob
          : A extends
                | `text/${string}`
                | TextLikeApplicationType
                | `${string}+xml`
                | `${string}+text`
                | `${string}+yaml`
                | `${string}+json-seq`
            ? string | Blob
            : ArrayBuffer | Uint8Array | Blob
  : never;

/** What req.vovk.body() parses a body of these content types into when there is no body schema. */
export type ParsedBodyTypeFromContentType<T extends ContentType[]> = T[number] extends infer A
  ? A extends '*/*' | 'application/json' | `${string}+json`
    ? unknown
    : A extends 'multipart/form-data' | 'application/x-www-form-urlencoded'
      ? Record<string, FormDataEntryValue | FormDataEntryValue[]>
      : A extends
            | `text/${string}`
            | TextLikeApplicationType
            | `${string}+xml`
            | `${string}+text`
            | `${string}+yaml`
            | `${string}+json-seq`
        ? string
        : File
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
