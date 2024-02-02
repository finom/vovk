import type {
  _KnownAny as KnownAny,
  _HttpMethod as HttpMethod,
  _ControllerStaticMethod,
  _VovkBody,
  _VovkQuery,
  _VovkParams,
} from '../types';
import { _StreamResponse as StreamResponse } from '../StreamResponse';

export type _StaticMethodInput<T extends _ControllerStaticMethod> = (_VovkBody<T> extends undefined | void
  ? { body?: undefined }
  : _VovkBody<T> extends null
    ? { body?: null }
    : { body: _VovkBody<T> }) &
  (_VovkQuery<T> extends undefined | void ? { query?: undefined } : { query: _VovkQuery<T> }) &
  (_VovkParams<T> extends undefined | void ? { params?: undefined } : { params: _VovkParams<T> });

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
    : ToPromise<ReturnType<T>>;

type OmitNever<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};

type _VovkClientWithNever<T, OPTS extends { [key: string]: KnownAny }> = {
  [K in keyof T]: T[K] extends (...args: KnownAny) => KnownAny ? ClientMethod<T[K], OPTS> : never;
};

export type _VovkClient<T, OPTS extends { [key: string]: KnownAny }> = OmitNever<_VovkClientWithNever<T, OPTS>>;

export type _VovkClientFetcher<OPTS extends Record<string, KnownAny> = Record<string, never>, T = KnownAny> = (
  options: {
    name: keyof T;
    httpMethod: HttpMethod;
    getPath: (params: { [key: string]: string }, query: { [key: string]: string }) => string;
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

export type _VovkClientOptions<OPTS extends Record<string, KnownAny> = Record<string, never>> = {
  fetcher?: _VovkClientFetcher<OPTS>;
  validateOnClient?: (
    input: { body?: unknown; query?: unknown },
    validators: { body?: unknown; query?: unknown }
  ) => unknown;
  defaultOptions?: Partial<OPTS>;
};
