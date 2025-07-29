import type { NextResponse } from 'next/server.js';
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
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
} from '../types.js';
import type { JSONLinesResponse } from '../JSONLinesResponse.js';
import type { defaultStreamHandler } from './defaultStreamHandler.js';
import type { defaultHandler } from './defaultHandler.js';
import { HttpException } from '../HttpException.js';

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
  ) => void | object | JSONLinesResponse<STREAM> | Promise<JSONLinesResponse<STREAM>>,
  OPTS extends Record<string, KnownAny>,
  STREAM,
  R,
  F extends VovkDefaultFetcherOptions<KnownAny>,
> = Partial<
  OPTS & {
    transform: (staticMethodReturn: Awaited<StaticMethodReturn<T>>, resp: Response) => R;
    fetcher: VovkClientFetcher<F>;
  }
>;

export type ClientMethodReturn<
  T extends (
    req: VovkRequest<KnownAny, KnownAny, KnownAny>,
    params: KnownAny
  ) => void | object | JSONLinesResponse<STREAM> | Promise<JSONLinesResponse<STREAM>>,
  STREAM,
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
  ) => void | object | JSONLinesResponse<STREAM> | Promise<JSONLinesResponse<STREAM>>) & {
    __types?: {
      body: KnownAny;
      query: KnownAny;
      params: KnownAny;
      output: KnownAny;
      iteration: KnownAny;
      isForm: boolean;
    };
  },
  OPTS extends Record<string, KnownAny>,
  STREAM extends KnownAny = unknown,
> = (IsEmptyObject<StaticMethodInput<T>> extends true
  ? <R, F extends VovkDefaultFetcherOptions<KnownAny> = VovkDefaultFetcherOptions<OPTS>>(
      options?: Prettify<StaticMethodOptions<T, OPTS, STREAM, R, F>>
    ) => ClientMethodReturn<T, STREAM, R>
  : <R, F extends VovkDefaultFetcherOptions<KnownAny> = VovkDefaultFetcherOptions<OPTS>>(
      options: Prettify<StaticMethodInput<T> & StaticMethodOptions<T, OPTS, STREAM, R, F>>
    ) => ClientMethodReturn<T, STREAM, R>) & {
  isRPC: true;
  schema: VovkHandlerSchema;
  controllerSchema: VovkControllerSchema;
  segmentSchema: VovkSegmentSchema;
  fullSchema: VovkSchema;
  path: string;
  queryKey: () => string[];
  mutationKey: () => string[];
  queryOptions<R>(
    input?: Prettify<StaticMethodInput<T> & StaticMethodOptions<T, OPTS, STREAM, R, VovkDefaultFetcherOptions<OPTS>>>,
    opts?: Partial<Omit<UseQueryOptions<Awaited<ClientMethodReturn<T, STREAM, R>>, HttpException>, 'queryFn'>>
  ): UseQueryOptions<
    Awaited<ClientMethodReturn<T, STREAM, R>> extends VovkStreamAsyncIterable<infer U>
      ? U[]
      : Awaited<ClientMethodReturn<T, STREAM, R>>,
    HttpException
  >;
  mutationOptions<R>(
    opts?: Partial<
      Omit<
        UseMutationOptions<
          Awaited<ClientMethodReturn<T, STREAM, R>> extends VovkStreamAsyncIterable<infer U>
            ? U[]
            : Awaited<ClientMethodReturn<T, STREAM, R>>,
          HttpException,
          Prettify<StaticMethodInput<T> & StaticMethodOptions<T, OPTS, STREAM, R, VovkDefaultFetcherOptions<OPTS>>>
        >,
        'mutationFn'
      >
    >
  ): UseMutationOptions<
    Awaited<ClientMethodReturn<T, STREAM, R>> extends VovkStreamAsyncIterable<infer U>
      ? U[]
      : Awaited<ClientMethodReturn<T, STREAM, R>>,
    HttpException,
    Prettify<StaticMethodInput<T> & StaticMethodOptions<T, OPTS, STREAM, R, VovkDefaultFetcherOptions<OPTS>>>
  >;
  __types: T['__types'];
};

type OmitNever<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};

type VovkClientWithNever<T, OPTS extends { [key: string]: KnownAny }> = {
  [K in keyof T]: T[K] extends (...args: KnownAny) => KnownAny ? ClientMethod<T[K], OPTS> : never;
};

export type VovkClient<T, OPTS extends { [key: string]: KnownAny }> = OmitNever<VovkClientWithNever<T, OPTS>>;

export type VovkClientFetcher<OPTS> = (
  options: {
    name: string;
    httpMethod: HttpMethod;
    getEndpoint: (data: {
      apiRoot: string | undefined;
      params: { [key: string]: string };
      query: { [key: string]: string };
    }) => string;
    validate: (input: { body?: unknown; query?: unknown; params?: unknown; endpoint: string }) => void | Promise<void>;
    defaultStreamHandler: typeof defaultStreamHandler;
    defaultHandler: typeof defaultHandler;
    schema: VovkHandlerSchema;
  },
  input: {
    body: unknown;
    query: { [key: string]: string };
    params: { [key: string]: string };
    meta?: { [key: string]: KnownAny };
  } & OPTS
) => Promise<[KnownAny, Response]>;

export type VovkDefaultFetcherOptions<T> = T & {
  apiRoot?: string;
  disableClientValidation?: boolean;
  validateOnClient?: VovkValidateOnClient;
  interpretAs?: string;
  init?: RequestInit;
};

export type VovkValidateOnClient = (
  input: { body?: unknown; query?: unknown; params?: unknown; endpoint: string },
  validation: Omit<Exclude<VovkHandlerSchema['validation'], undefined>, 'output' | 'iteration'>,
  fullSchema: VovkSchema
) => void | Promise<void>;
