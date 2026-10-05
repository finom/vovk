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
import type { ContentType, VovkValidateOnClient } from './validation.js';

type OmitNullable<T> = {
  [K in keyof T as T[K] extends null | undefined ? never : K]: T[K];
};

type MetaInput = { meta?: { [key: string]: KnownAny } };

// a plain method, or a mixin, declares a part of the request with any type but unknown, null and undefined
type IsDeclared<T> = unknown extends T ? false : [T] extends [null | undefined] ? false : true;

// a body is optional when it may be undefined, a query or params when {} fits their type
type PlainInput<TBody, TQuery, TParams> = (IsDeclared<TBody> extends true
  ? undefined extends TBody
    ? { body?: TBody }
    : { body: TBody }
  : unknown) &
  (IsDeclared<TQuery> extends true ? ({} extends TQuery ? { query?: TQuery } : { query: TQuery }) : unknown) &
  (IsDeclared<TParams> extends true ? ({} extends TParams ? { params?: TParams } : { params: TParams }) : unknown);

// the parts of a request a plain method types with VovkRequest<TBody, TQuery, TParams>
type RequestParts<TReq> = TReq extends {
  vovk: { body: () => Promise<infer TBody>; query: () => infer TQuery; params: () => infer TParams };
}
  ? PlainInput<TBody, TQuery, TParams>
  : unknown;

type StaticMethodLike = ((req: VovkRequest<KnownAny, KnownAny, KnownAny>, params: KnownAny) => KnownAny) & {
  __types?: {
    body: unknown;
    contentType: ContentType[];
  };
};

export type StaticMethodInput<T extends StaticMethodLike> = OmitNullable<
  (T extends { __types: { input: infer TInput } }
    ? TInput
    : RequestParts<Parameters<T>[0]> & PlainInput<unknown, unknown, Parameters<T>[1]>) &
    MetaInput
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

// the part of a method's input that goes into its URL
type URLInput<T extends StaticMethodLike> = Pick<
  Prettify<StaticMethodInput<T>>,
  Extract<'params' | 'query', keyof Prettify<StaticMethodInput<T>>>
>;

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
  getURL: IsEmptyObject<URLInput<T>> extends true
    ? (urlInput?: URLInput<T> & { apiRoot?: string }) => string
    : (urlInput: URLInput<T> & { apiRoot?: string }) => string;
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
