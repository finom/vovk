import type { NextResponse } from 'next/server.js';
import type { JSONLinesResponder } from '../core/JSONLinesResponder.js';
import type { defaultStreamHandler } from '../client/defaultStreamHandler.js';
import type { defaultHandler } from '../client/defaultHandler.js';
import type { VovkRequest } from './request.js';
import type {
  ControllerStaticMethod,
  VovkControllerSchema,
  VovkHandlerSchema,
  VovkSchema,
  VovkSegmentSchema,
} from './core.js';
import type { IsEmptyObject, KnownAny, Prettify } from './utils.js';
import type { HttpMethod } from './enums.js';
import type { VovkValidateOnClient } from './validation.js';

type OmitNullable<T> = {
  [K in keyof T as T[K] extends null | undefined ? never : K]: T[K];
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type Empty = {}; // TODO: Remove and replace by "object"

export type StaticMethodInput<
  T extends ((req: VovkRequest<KnownAny, KnownAny, KnownAny>, params: KnownAny) => KnownAny) & {
    __types?: {
      isForm: boolean;
    };
  },
> = OmitNullable<
  (Parameters<T>[0] extends VovkRequest<infer TBody, infer TQuery, infer TParams>
    ? (TBody extends Record<KnownAny, KnownAny>
        ? {
            body: T['__types'] extends { isForm: true } ? FormData : TBody;
          }
        : Empty) &
        (TQuery extends Record<KnownAny, KnownAny>
          ? {
              query: TQuery;
            }
          : Empty) &
        (TParams extends Record<KnownAny, KnownAny>
          ? {
              params: TParams;
            }
          : Empty) & { meta?: { [key: string]: KnownAny } }
    : Empty) &
    (Parameters<T>[1] extends Record<KnownAny, KnownAny> ? { params: Parameters<T>[1] } : Empty)
>;

type ToPromise<T> = T extends PromiseLike<unknown> ? T : Promise<T>;

export type VovkStreamAsyncIterable<T> = {
  status: number;
  asPromise: () => Promise<T[]>;
  [Symbol.dispose](): Promise<void> | void;
  [Symbol.asyncDispose](): Promise<void> | void;
  [Symbol.asyncIterator](): AsyncIterator<T>;
  abortWithoutError: () => void;
  onIterate: (cb: (data: T, i: number) => void) => () => void;
  abortController: AbortController;
};

type IsNextJs = NextResponse extends Response ? true : false;

type StaticMethodReturn<T extends ControllerStaticMethod> = IsNextJs extends true
  ? ReturnType<T> extends NextResponse<infer U> | Promise<NextResponse<infer U>>
    ? U
    : ReturnType<T> extends Response | Promise<Response>
      ? Awaited<ReturnType<T>>
      : ReturnType<T>
  : ReturnType<T> extends Response | Promise<Response>
    ? Awaited<ReturnType<T>>
    : ReturnType<T>;

type StaticMethodReturnPromise<T extends ControllerStaticMethod> = ToPromise<StaticMethodReturn<T>>;

type StaticMethodOptions<
  T extends (
    req: VovkRequest<KnownAny, KnownAny, KnownAny>,
    params: KnownAny
  ) => void | object | JSONLinesResponder<TStreamIteration> | Promise<JSONLinesResponder<TStreamIteration>>,
  TFetcherOptions extends Record<string, KnownAny>,
  TStreamIteration,
  R,
  F extends VovkFetcherOptions<KnownAny>,
> = Partial<
  TFetcherOptions & {
    transform: (
      staticMethodReturn: Awaited<StaticMethodReturn<T>> extends JSONLinesResponder<infer U>
        ? VovkStreamAsyncIterable<U>
        : Awaited<StaticMethodReturn<T>>,
      resp: Response
    ) => R;
    fetcher: VovkFetcher<F>;
  }
>;

export type ClientMethodReturn<
  T extends (
    req: VovkRequest<KnownAny, KnownAny, KnownAny>,
    params: KnownAny
  ) => void | object | JSONLinesResponder<TStreamIteration> | Promise<JSONLinesResponder<TStreamIteration>>,
  TStreamIteration,
  R,
> = R extends object
  ? Promise<Awaited<R>>
  : ReturnType<T> extends
        | Promise<JSONLinesResponder<infer U>>
        | JSONLinesResponder<infer U>
        | Iterator<infer U>
        | AsyncIterator<infer U>
    ? Promise<VovkStreamAsyncIterable<U>>
    : StaticMethodReturnPromise<T>;
/* ReturnType<T> extends
    | Promise<JSONLinesResponder<infer U>>
    | JSONLinesResponder<infer U>
    | Iterator<infer U>
    | AsyncIterator<infer U>
    ? Promise<VovkStreamAsyncIterable<U>>
    : R extends object
      ? Promise<Awaited<R>>
      : StaticMethodReturnPromise<T>; */

export type ClientMethod<
  T extends ((
    req: VovkRequest<KnownAny, KnownAny, KnownAny>,
    params: KnownAny
  ) => void | object | JSONLinesResponder<TStreamIteration> | Promise<JSONLinesResponder<TStreamIteration>>) & {
    __types?: {
      body: KnownAny;
      query: KnownAny;
      params: KnownAny;
      output: KnownAny;
      iteration: KnownAny;
      isForm: boolean;
    };
  },
  TFetcherOptions extends Record<string, KnownAny>,
  TStreamIteration extends KnownAny = unknown,
> = (IsEmptyObject<StaticMethodInput<T>> extends true
  ? <R, F extends VovkFetcherOptions<KnownAny> = VovkFetcherOptions<TFetcherOptions>>(
      options?: Prettify<StaticMethodOptions<T, TFetcherOptions, TStreamIteration, R, F>>
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

type VovkClientWithNever<T, TFetcherOptions extends { [key: string]: KnownAny }> = {
  [K in keyof T]: T[K] extends (...args: KnownAny) => KnownAny ? ClientMethod<T[K], TFetcherOptions> : never;
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
