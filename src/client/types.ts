import {
  _KnownAny as KnownAny,
  _HttpMethod as HttpMethod,
  _ControllerStaticMethod,
  _SmoothieBody,
  _SmoothieQuery,
  _SmoothieParams,
} from '../types';
import { _StreamResponse as StreamResponse } from '../StreamResponse';

export type _StaticMethodInput<T extends _ControllerStaticMethod> = (_SmoothieBody<T> extends undefined | void
  ? { body?: undefined }
  : _SmoothieBody<T> extends null
    ? { body?: null }
    : { body: _SmoothieBody<T> }) &
  (_SmoothieQuery<T> extends undefined | void ? { query?: undefined } : { query: _SmoothieQuery<T> }) &
  (_SmoothieParams<T> extends undefined | void ? { params?: undefined } : { params: _SmoothieParams<T> });

type ToPromise<T> = T extends PromiseLike<unknown> ? T : Promise<T>;

export type _PromiseWithStream<T> = Promise<T[]> & {
  onMessage: (handler: (message: T) => void | Promise<void>) => _PromiseWithStream<T>;
  cancel: () => Promise<void> | void;
};

type ClientMethod<
  T extends (...args: KnownAny[]) => void | object | StreamResponse<STREAM> | Promise<StreamResponse<STREAM>>,
  OPTS extends Record<string, KnownAny>,
  STREAM extends KnownAny = unknown,
> = <R>(
  options: (_StaticMethodInput<T> & OPTS extends { body?: undefined | null; query?: undefined; params?: undefined }
    ? unknown
    : Parameters<T>[0] extends void
      ? _StaticMethodInput<T>['params'] extends object
        ? { params: _StaticMethodInput<T>['params'] }
        : unknown
      : _StaticMethodInput<T>) & { isStream?: boolean } & OPTS
) => ReturnType<T> extends Promise<StreamResponse<infer U>> | StreamResponse<infer U>
  ? _PromiseWithStream<U>
  : R extends object
    ? Promise<R>
    : ToPromise<ReturnType<T>>;

export type _SmoothieClient<T, OPTS extends { [key: string]: KnownAny }> = {
  [K in keyof T]: T[K] extends (...args: KnownAny) => KnownAny ? ClientMethod<T[K], OPTS> : never;
};

export type _SmoothieClientFetcher<OPTS extends Record<string, KnownAny> = Record<string, never>, T = KnownAny> = (
  options: {
    name: keyof T;
    httpMethod: HttpMethod;
    getPath: (params: { [key: string]: string }, query: { [key: string]: string }) => string;
    validate: (input: { body?: unknown; query?: unknown }) => void;
    onStreamMessage?: (message: unknown) => void;
    setReader?: (reader: ReadableStreamDefaultReader<Uint8Array>) => void;
  },
  input: {
    body: unknown;
    query: { [key: string]: string };
    params: { [key: string]: string };
  } & OPTS
) => KnownAny;

export type _SmoothieClientOptions<OPTS extends Record<string, KnownAny> = Record<string, never>> = {
  disableClientValidation?: boolean;
  streamFetcher?: _SmoothieClientFetcher<OPTS> | null;
  validateOnClient?: (
    input: { body?: unknown; query?: unknown },
    validators: { body?: unknown; query?: unknown }
  ) => unknown;
  defaultOptions?: Partial<OPTS>;
};
