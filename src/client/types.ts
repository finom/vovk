import type {
  _KnownAny as KnownAny,
  _HttpMethod as HttpMethod,
  _ControllerStaticMethod,
  _VovkControllerBody,
  _VovkControllerQuery,
  _VovkControllerParams,
} from '../types';
import { _StreamResponse as StreamResponse } from '../StreamResponse';
import { NextResponse } from 'next/server';

export type _StaticMethodInput<T extends _ControllerStaticMethod> = (_VovkControllerBody<T> extends undefined | void
  ? { body?: undefined }
  : _VovkControllerBody<T> extends null
    ? { body?: null }
    : { body: _VovkControllerBody<T> }) &
  (_VovkControllerQuery<T> extends undefined | void ? { query?: undefined } : { query: _VovkControllerQuery<T> }) &
  (_VovkControllerParams<T> extends undefined | void ? { params?: undefined } : { params: _VovkControllerParams<T> });

type ToPromise<T> = T extends PromiseLike<unknown> ? T : Promise<T>;

export type _StreamAsyncIterator<T> = {
  status: number;
  [Symbol.dispose](): Promise<void> | void;
  [Symbol.asyncDispose](): Promise<void> | void;
  [Symbol.asyncIterator](): AsyncIterator<T>;
  cancel: () => Promise<void> | void;
};

type ClientMethod<
  T extends (...args: KnownAny[]) => void | object | StreamResponse<STREAM> | Promise<StreamResponse<STREAM>>,
  OPTS extends Record<string, KnownAny>,
  STREAM extends KnownAny = unknown,
> = <R>(
  options: (_StaticMethodInput<T> extends { body?: undefined | null; query?: undefined; params?: undefined }
    ? unknown
    : Parameters<T>[0] extends void
      ? _StaticMethodInput<T>['params'] extends object
        ? { params: _StaticMethodInput<T>['params'] }
        : unknown
      : _StaticMethodInput<T>) &
    (Partial<OPTS> | void)
) => ReturnType<T> extends
  | Promise<StreamResponse<infer U>>
  | StreamResponse<infer U>
  | Iterator<infer U>
  | AsyncIterator<infer U>
  ? Promise<_StreamAsyncIterator<U>>
  : R extends object
    ? Promise<R>
    : ReturnType<T> extends NextResponse<infer U> | Promise<NextResponse<infer U>>
      ? ToPromise<U>
      : ToPromise<ReturnType<T>>;

type OmitNever<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};

type _VovkClientWithNever<T, OPTS extends { [key: string]: KnownAny }> = {
  [K in keyof T]: T[K] extends { handler: (...args: KnownAny) => KnownAny }
    ? ClientMethod<T[K]['handler'], OPTS>
    : T[K] extends (...args: KnownAny) => KnownAny
      ? ClientMethod<T[K], OPTS>
      : never;
};

export type _VovkClient<T, OPTS extends { [key: string]: KnownAny }> = OmitNever<_VovkClientWithNever<T, OPTS>>;

export type _VovkClientFetcher<OPTS extends Record<string, KnownAny> = Record<string, never>, T = KnownAny> = (
  options: {
    name: keyof T;
    httpMethod: HttpMethod;
    getEndpoint: (data: {
      prefix: string;
      params: { [key: string]: string };
      query: { [key: string]: string };
    }) => string;
    validate: (input: { body?: unknown; query?: unknown }) => void | Promise<void>;
    defaultStreamHandler: (response: Response) => Promise<_StreamAsyncIterator<unknown>>;
    defaultHandler: (response: Response) => Promise<unknown>;
  },
  input: {
    body: unknown;
    query: { [key: string]: string };
    params: { [key: string]: string };
  } & OPTS
) => KnownAny;

// `RequestInit` is the type of options passed to fetch function
export interface _VovkDefaultFetcherOptions extends Omit<RequestInit, 'body' | 'method'> {
  reactNative?: { textStreaming: boolean };
  prefix?: string;
  disableClientValidation?: boolean;
}

export type _VovkClientOptions<OPTS extends Record<string, KnownAny> = Record<string, never>> = {
  fetcher?: _VovkClientFetcher<OPTS>;
  validateOnClient?: (
    input: { body?: unknown; query?: unknown },
    validators: { body?: unknown; query?: unknown }
  ) => unknown;
  defaultOptions?: Partial<OPTS>;
};
