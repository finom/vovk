import type {
  KnownAny,
  HttpMethod,
  ControllerStaticMethod,
  VovkControllerBody,
  VovkControllerQuery,
  VovkControllerParams,
  VovkHandlerSchema,
  VovkControllerSchema,
  VovkSegmentSchema,
  VovkFullSchema,
} from '../types';
import type { JSONLinesResponse } from '../JSONLinesResponse';
import type { NextResponse } from 'next/server';

export type StaticMethodInput<T extends ControllerStaticMethod> = (VovkControllerBody<T> extends undefined | void
  ? { body?: undefined }
  : VovkControllerBody<T> extends null
    ? { body?: null }
    : { body: VovkControllerBody<T> }) &
  (VovkControllerQuery<T> extends undefined | void ? { query?: undefined } : { query: VovkControllerQuery<T> }) &
  (VovkControllerParams<T> extends undefined | void ? { params?: undefined } : { params: VovkControllerParams<T> });

type ToPromise<T> = T extends PromiseLike<unknown> ? T : Promise<T>;

export type VovkStreamAsyncIterable<T> = {
  status: number;
  [Symbol.dispose](): Promise<void> | void;
  [Symbol.asyncDispose](): Promise<void> | void;
  [Symbol.asyncIterator](): AsyncIterator<T>;
  cancel: () => Promise<void> | void;
};

type StaticMethodReturn<T extends ControllerStaticMethod> =
  ReturnType<T> extends NextResponse<infer U> | Promise<NextResponse<infer U>>
    ? U
    : ReturnType<T> extends Response | Promise<Response>
      ? Awaited<ReturnType<T>>
      : ReturnType<T>;

type StaticMethodReturnPromise<T extends ControllerStaticMethod> = ToPromise<StaticMethodReturn<T>>;

type ClientMethod<
  T extends ((
    ...args: KnownAny[]
  ) => void | object | JSONLinesResponse<STREAM> | Promise<JSONLinesResponse<STREAM>>) & {
    __output?: KnownAny;
    __iteration?: KnownAny;
  },
  OPTS extends Record<string, KnownAny>,
  STREAM extends KnownAny = unknown,
> = (<R>(
  options: (StaticMethodInput<T> extends { body?: undefined | null; query?: undefined; params?: undefined }
    ? unknown
    : Parameters<T>[0] extends void
      ? StaticMethodInput<T>['params'] extends object
        ? { params: StaticMethodInput<T>['params'] }
        : unknown
      : StaticMethodInput<T>) &
    (Partial<
      OPTS & {
        transform: (staticMethodReturn: Awaited<StaticMethodReturn<T>>) => R;
      }
    > | void)
) => ReturnType<T> extends
  | Promise<JSONLinesResponse<infer U>>
  | JSONLinesResponse<infer U>
  | Iterator<infer U>
  | AsyncIterator<infer U>
  ? Promise<VovkStreamAsyncIterable<U>>
  : R extends object
    ? Promise<R>
    : StaticMethodReturnPromise<T>) & {
  isRPC: true;
  schema: VovkHandlerSchema;
  controllerSchema: VovkControllerSchema;
  segmentSchema: VovkSegmentSchema;
  fullSchema: VovkFullSchema;
  __output: T['__output'];
  __iteration: T['__iteration'];
};

type OmitNever<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};

type VovkClientWithNever<T, OPTS extends { [key: string]: KnownAny }> = {
  [K in keyof T]: T[K] extends (...args: KnownAny) => KnownAny ? ClientMethod<T[K], OPTS> : never;
};

export type VovkClient<T, OPTS extends { [key: string]: KnownAny }> = OmitNever<VovkClientWithNever<T, OPTS>>;

export type VovkClientFetcher<OPTS extends Record<string, KnownAny> = Record<string, never>, T = KnownAny> = (
  options: {
    name: keyof T;
    httpMethod: HttpMethod;
    getEndpoint: (data: {
      apiRoot: string;
      params: { [key: string]: string };
      query: { [key: string]: string };
    }) => string;
    validate: (input: { body?: unknown; query?: unknown; params?: unknown; endpoint: string }) => void | Promise<void>;
    defaultStreamHandler: (response: Response) => Promise<VovkStreamAsyncIterable<unknown>>;
    defaultHandler: (response: Response) => Promise<unknown>;
  },
  input: {
    body: unknown;
    query: { [key: string]: string };
    params: { [key: string]: string };
  } & OPTS
) => KnownAny;

// `RequestInit` is the type of options passed to fetch function
export interface VovkDefaultFetcherOptions {
  apiRoot?: string;
  disableClientValidation?: boolean;
  validateOnClient?: VovkValidateOnClient;
  fetcher?: VovkClientFetcher;
  interpretAs?: string;
  init?: RequestInit;
}

export type VovkValidateOnClient = (
  input: { body?: unknown; query?: unknown; params?: unknown; endpoint: string },
  validation: Omit<Exclude<VovkHandlerSchema['validation'], undefined>, 'output' | 'iteration'>,
  fullSchema: VovkFullSchema
) => void | Promise<void>;

export type VovkClientOptions<OPTS extends Record<string, KnownAny> = Record<string, never>> = {
  fetcher?: VovkClientFetcher<OPTS>;
  validateOnClient?: VovkValidateOnClient;
  defaultOptions?: Partial<OPTS>;
};
