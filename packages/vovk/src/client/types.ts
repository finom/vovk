import type { NextResponse } from 'next/server';
import type {
  KnownAny,
  HttpMethod,
  ControllerStaticMethod,
  VovkHandlerSchema,
  VovkControllerSchema,
  VovkSegmentSchema,
  VovkSchema,
  VovkRequest,
  Prettify,
  IsEmptyObject,
} from '../types';
import type { JSONLinesResponse } from '../JSONLinesResponse';
import type { defaultStreamHandler } from './defaultStreamHandler';
import type { defaultHandler } from './defaultHandler';

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
  (Parameters<T>[0] extends VovkRequest<infer BODY, infer QUERY, infer PARAMS>
    ? (BODY extends Record<KnownAny, KnownAny>
        ? {
            body: T['__types'] extends { isForm: true } ? FormData : BODY;
          }
        : Empty) &
        (QUERY extends Record<KnownAny, KnownAny>
          ? {
              query: QUERY;
            }
          : Empty) &
        (PARAMS extends Record<KnownAny, KnownAny>
          ? {
              params: PARAMS;
            }
          : Empty) & { meta?: { [key: string]: KnownAny } }
    : Empty) &
    (Parameters<T>[1] extends Record<KnownAny, KnownAny> ? { params: Parameters<T>[1] } : Empty)
>;

type ToPromise<T> = T extends PromiseLike<unknown> ? T : Promise<T>;

export type VovkStreamAsyncIterable<T> = {
  status: number;
  [Symbol.dispose](): Promise<void> | void;
  [Symbol.asyncDispose](): Promise<void> | void;
  [Symbol.asyncIterator](): AsyncIterator<T>;
  onIterate: (cb: (data: T, i: number) => void) => () => void;
  abort: () => Promise<void> | void;
};

type StaticMethodReturn<T extends ControllerStaticMethod> =
  ReturnType<T> extends NextResponse<infer U> | Promise<NextResponse<infer U>>
    ? U
    : ReturnType<T> extends Response | Promise<Response>
      ? Awaited<ReturnType<T>>
      : ReturnType<T>;

type StaticMethodReturnPromise<T extends ControllerStaticMethod> = ToPromise<StaticMethodReturn<T>>;

type StaticMethodOptions<
  T extends (
    req: VovkRequest<KnownAny, KnownAny, KnownAny>,
    params: KnownAny
  ) => void | object | JSONLinesResponse<TStreamIteration> | Promise<JSONLinesResponse<TStreamIteration>>,
  TFetcherOptions extends Record<string, KnownAny>,
  TStreamIteration,
  R,
  F extends VovkDefaultFetcherOptions<KnownAny>,
> = Partial<
  TFetcherOptions & {
    transform: (staticMethodReturn: Awaited<StaticMethodReturn<T>>, resp: Response) => R;
    fetcher: VovkClientFetcher<F>;
  }
>;

export type ClientMethodReturn<
  T extends (
    req: VovkRequest<KnownAny, KnownAny, KnownAny>,
    params: KnownAny
  ) => void | object | JSONLinesResponse<TStreamIteration> | Promise<JSONLinesResponse<TStreamIteration>>,
  TStreamIteration,
  R,
> =
  ReturnType<T> extends
    | Promise<JSONLinesResponse<infer U>>
    | JSONLinesResponse<infer U>
    | Iterator<infer U>
    | AsyncIterator<infer U>
    ? Promise<VovkStreamAsyncIterable<U>>
    : R extends object
      ? Promise<Awaited<R>>
      : StaticMethodReturnPromise<T>;

export type ClientMethod<
  T extends ((
    req: VovkRequest<KnownAny, KnownAny, KnownAny>,
    params: KnownAny
  ) => void | object | JSONLinesResponse<TStreamIteration> | Promise<JSONLinesResponse<TStreamIteration>>) & {
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
  ? <R, F extends VovkDefaultFetcherOptions<KnownAny> = VovkDefaultFetcherOptions<TFetcherOptions>>(
      options?: Prettify<StaticMethodOptions<T, TFetcherOptions, TStreamIteration, R, F>>
    ) => ClientMethodReturn<T, TStreamIteration, R>
  : <R, F extends VovkDefaultFetcherOptions<KnownAny> = VovkDefaultFetcherOptions<TFetcherOptions>>(
      options: Prettify<StaticMethodInput<T> & StaticMethodOptions<T, TFetcherOptions, TStreamIteration, R, F>>
    ) => ClientMethodReturn<T, TStreamIteration, R>) & {
  isRPC: true;
  schema: VovkHandlerSchema;
  controllerSchema: VovkControllerSchema;
  segmentSchema: VovkSegmentSchema;
  fullSchema: VovkSchema;
  path: string;
  queryKey: (key?: unknown[]) => unknown[];
  __types: T['__types'];
};

type OmitNever<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};

type VovkClientWithNever<T, TFetcherOptions extends { [key: string]: KnownAny }> = {
  [K in keyof T]: T[K] extends (...args: KnownAny) => KnownAny ? ClientMethod<T[K], TFetcherOptions> : never;
};

export type VovkClient<T, TFetcherOptions extends { [key: string]: KnownAny }> = OmitNever<
  VovkClientWithNever<T, TFetcherOptions>
>;

export type VovkClientFetcher<TFetcherOptions> = (
  options: {
    name: string;
    httpMethod: HttpMethod;
    getEndpoint: (data: { apiRoot: string | undefined; params: unknown; query: unknown }) => string;
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

export type VovkDefaultFetcherOptions<T> = T & {
  apiRoot?: string;
  disableClientValidation?: boolean;
  validateOnClient?: VovkValidateOnClient<T>;
  interpretAs?: string;
  init?: RequestInit;
};

export type VovkValidateOnClient<TFetcherOptions> = (
  input: { body?: unknown; query?: unknown; params?: unknown; meta?: unknown } & TFetcherOptions,
  validation: Omit<Exclude<VovkHandlerSchema['validation'], undefined>, 'output' | 'iteration'>,
  meta: { fullSchema: VovkSchema; endpoint: string }
) => KnownAny | Promise<KnownAny>;
