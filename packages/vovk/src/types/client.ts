import type { defaultHandler } from '../client/default-handler.js';
import type { defaultStreamHandler } from '../client/default-stream-handler.js';
import type { JSONLinesResponder } from '../core/json-lines-responder.js';
import type {
  ControllerStaticMethod,
  VovkControllerSchema,
  VovkHandlerSchema,
  VovkSchema,
  VovkSegmentSchema,
} from './core.js';
import type { HttpMethod } from './enums.js';
import type { VovkRequest } from './request.js';
import type { IsAny, IsEmptyObject, KnownAny, Prettify } from './utils.js';
import type { BodyTypeFromContentType, ContentType, VovkValidateOnClient } from './validation.js';

type OmitNullable<T> = {
  [K in keyof T as T[K] extends null | undefined ? never : K]: T[K];
};

export type StaticMethodInput<
  T extends ((req: VovkRequest<KnownAny, KnownAny, KnownAny>, params: KnownAny) => KnownAny) & {
    __types?: {
      body: unknown;
      contentType: ContentType[];
    };
  },
> = OmitNullable<
  (Parameters<T>[0] extends VovkRequest<infer TBody, infer TQuery, infer TParams>
    ? (T['__types'] extends { body: infer TSchemaBody; contentType: infer CT extends ContentType[] }
        ? unknown extends TSchemaBody
          ? // no body schema: a declared content type other than JSON still takes a body
            CT[number] extends 'application/json'
            ? unknown
            : { body?: BodyTypeFromContentType<CT, unknown> }
          : {
              body: BodyTypeFromContentType<CT, TSchemaBody>;
            }
        : TBody extends Record<KnownAny, KnownAny>
          ? {
              body: TBody;
            }
          : unknown) &
        (TQuery extends Record<KnownAny, KnownAny>
          ? {
              query: TQuery;
            }
          : unknown) &
        (TParams extends Record<KnownAny, KnownAny>
          ? {
              params: TParams;
            }
          : unknown) & { meta?: { [key: string]: KnownAny } }
    : unknown) &
    (Parameters<T>[1] extends Record<KnownAny, KnownAny> ? { params: Parameters<T>[1] } : unknown)
>;

type ToPromise<T> = T extends PromiseLike<unknown> ? T : Promise<T>;

// the dispose symbols where the lib has them (esnext.disposable), so a project on an older lib still compiles
type DisposeSymbol = SymbolConstructor extends { readonly dispose: infer S extends symbol } ? S : never;
type AsyncDisposeSymbol = SymbolConstructor extends { readonly asyncDispose: infer S extends symbol } ? S : never;

export type VovkStreamAsyncIterable<T> = {
  status: number;
  asPromise: () => Promise<T[]>;
  [Symbol.asyncIterator](): AsyncIterator<T>;
  abortSilently: () => void;
  onIterate: (cb: (data: T, i: number) => void) => () => void;
  abortController: AbortController;
} & { [K in DisposeSymbol | AsyncDisposeSymbol]: () => Promise<void> | void };

// a Next.js response keeps its body type in a symbol-keyed property, read without importing next
type NextResponseBody<R> = {
  [K in keyof R]: K extends symbol ? (R[K] extends { cookies: unknown; body?: infer B } ? B : never) : never;
}[keyof R];

type ActualReturnType<T extends ControllerStaticMethod> = T extends {
  __handleFn: (...args: KnownAny[]) => infer R;
}
  ? R
  : ReturnType<T>;

type StaticMethodReturn<T extends ControllerStaticMethod> = [IsAny<Awaited<ActualReturnType<T>>>] extends [true]
  ? ActualReturnType<T>
  : ActualReturnType<T> extends Response | Promise<Response>
    ? [NextResponseBody<Awaited<ActualReturnType<T>>>] extends [never]
      ? Awaited<ActualReturnType<T>>
      : NextResponseBody<Awaited<ActualReturnType<T>>>
    : ActualReturnType<T>;

type StaticMethodReturnPromise<T extends ControllerStaticMethod> = ToPromise<StaticMethodReturn<T>>;

// the items a handler streams: from the iteration schema, else from a generator or JSONLinesResponder it returns
type StreamItem<T extends ControllerStaticMethod> = T extends { __types: { iteration: infer U } }
  ? unknown extends U
    ? HandlerStreamItem<T>
    : U
  : HandlerStreamItem<T>;

// a handler typed any or Promise<any> is not a stream; IsAny goes in a tuple because, for a type from a module
// that isn't installed (next in a client bundle used without Next), it's any rather than true
type HandlerStreamItem<T extends ControllerStaticMethod> = [IsAny<Awaited<ActualReturnType<T>>>] extends [true]
  ? never
  : ActualReturnType<T> extends
        | Promise<JSONLinesResponder<infer U>>
        | JSONLinesResponder<infer U>
        | Iterator<infer U>
        | AsyncIterator<infer U>
    ? U
    : never;

// what a call resolves to without transform
type ClientMethodData<T extends ControllerStaticMethod> = [StreamItem<T>] extends [never]
  ? Awaited<StaticMethodReturn<T>>
  : VovkStreamAsyncIterable<StreamItem<T>>;

type StaticMethodOptions<
  T extends (
    req: VovkRequest<KnownAny, KnownAny, KnownAny>,
    params: KnownAny
  ) => undefined | object | JSONLinesResponder<TStreamIteration> | Promise<JSONLinesResponder<TStreamIteration>>,
  TFetcherOptions extends Record<string, KnownAny>,
  TStreamIteration,
  R,
  F extends VovkFetcherOptions<KnownAny>,
> = Partial<
  TFetcherOptions & {
    transform: (staticMethodReturn: ClientMethodData<T>, resp: Response) => R;
    fetcher: VovkFetcher<F>;
  }
>;

export type ClientMethodReturn<
  T extends (
    req: VovkRequest<KnownAny, KnownAny, KnownAny>,
    params: KnownAny
  ) => undefined | object | JSONLinesResponder<TStreamIteration> | Promise<JSONLinesResponder<TStreamIteration>>,
  TStreamIteration,
  R,
> = [IsAny<R>] extends [true]
  ? Promise<R>
  : unknown extends R // no transform, or one that returns unknown
    ? [StreamItem<T>] extends [never]
      ? StaticMethodReturnPromise<T>
      : Promise<VovkStreamAsyncIterable<StreamItem<T>>>
    : Promise<Awaited<R>>;

export type ClientMethod<
  T extends ((
    req: VovkRequest<KnownAny, KnownAny, KnownAny>,
    params: KnownAny
  ) => undefined | object | JSONLinesResponder<TStreamIteration> | Promise<JSONLinesResponder<TStreamIteration>>) & {
    __types?: {
      body: KnownAny;
      query: KnownAny;
      params: KnownAny;
      output: KnownAny;
      iteration: KnownAny;
      contentType: ContentType[];
    };
  },
  TFetcherOptions extends Record<string, KnownAny>,
  TStreamIteration extends KnownAny = unknown,
> = (IsEmptyObject<StaticMethodInput<T>> extends true
  ? <R, F extends VovkFetcherOptions<KnownAny> = VovkFetcherOptions<TFetcherOptions>>(
      options?: Prettify<StaticMethodInput<T> & StaticMethodOptions<T, TFetcherOptions, TStreamIteration, R, F>>
    ) => ClientMethodReturn<T, TStreamIteration, R>
  : <R, F extends VovkFetcherOptions<KnownAny> = VovkFetcherOptions<TFetcherOptions>>(
      options: Prettify<StaticMethodInput<T> & StaticMethodOptions<T, TFetcherOptions, TStreamIteration, R, F>>
    ) => ClientMethodReturn<T, TStreamIteration, R>) & {
  isRPC: true;
  schema: VovkHandlerSchema;
  controllerSchema: VovkControllerSchema;
  segmentSchema: VovkSegmentSchema;
  fullSchema: VovkSchema;
  getURL: IsEmptyObject<
    Pick<Prettify<StaticMethodInput<T>>, Extract<'params' | 'query', keyof Prettify<StaticMethodInput<T>>>>
  > extends true
    ? (urlInput?: { apiRoot?: string }) => string
    : (
        urlInput: Pick<
          Prettify<StaticMethodInput<T>>,
          Extract<'params' | 'query', keyof Prettify<StaticMethodInput<T>>>
        > & {
          apiRoot?: string;
        }
      ) => string;
  apiRoot: string;
  queryKey: (key?: unknown[]) => unknown[];
  __types: T['__types'];
};

type OmitNever<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};

// a handler takes a request or nothing, so a static helper such as formatName(name: string) gets no RPC method
type IsHandler<F> = F extends () => unknown
  ? true
  : F extends (req: infer R, ...args: KnownAny[]) => unknown
    ? unknown extends R
      ? true
      : [R] extends [Request]
        ? true
        : false
    : false;

type VovkClientWithNever<T, TFetcherOptions extends { [key: string]: KnownAny }> = {
  [K in keyof T]: T[K] extends (...args: KnownAny) => KnownAny
    ? IsHandler<T[K]> extends true
      ? ClientMethod<T[K], TFetcherOptions>
      : never
    : never;
};

export type VovkRPCModule<T, TFetcherOptions extends { [key: string]: KnownAny }> = OmitNever<
  VovkClientWithNever<T, TFetcherOptions>
> & {
  withDefaults: (newOptions?: VovkFetcherOptions<TFetcherOptions>) => VovkRPCModule<T, TFetcherOptions>;
};

/**
 * Fetcher function type for client requests.
 * @see https://vovk.dev/imports
 */
export type VovkFetcher<TFetcherOptions> = (
  options: {
    name: string;
    httpMethod: HttpMethod;
    getURL: (data: { apiRoot: string | undefined; params: unknown; query: unknown }) => string;
    validate: (
      inputOptions: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
        meta?: unknown;
      } & TFetcherOptions,
      meta: { endpoint: string }
    ) => KnownAny | Promise<KnownAny>;
    defaultStreamHandler: typeof defaultStreamHandler;
    defaultHandler: typeof defaultHandler;
    schema: VovkHandlerSchema;
  },
  input: {
    body?: unknown;
    query?: unknown;
    params?: unknown;
    meta?: unknown;
  } & TFetcherOptions
) => Promise<[KnownAny, Response]>;

export type VovkFetcherOptions<T> = T & {
  apiRoot?: string;
  disableClientValidation?: boolean;
  validateOnClient?: VovkValidateOnClient<T> | Promise<{ validateOnClient: VovkValidateOnClient<T> }>;
  interpretAs?: string;
  init?: RequestInit;
};
