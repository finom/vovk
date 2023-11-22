import {
  _KnownAny as KnownAny,
  _HttpMethod as HttpMethod,
  _ControllerStaticMethod,
  _SmoothieBody,
  _SmoothieQuery,
  _SmoothieParams,
} from '../types';

export type _StaticMethodInput<T extends _ControllerStaticMethod> = (_SmoothieBody<T> extends undefined | void
  ? { body?: undefined }
  : _SmoothieBody<T> extends null
    ? { body?: null }
    : { body: _SmoothieBody<T> }) &
  (_SmoothieQuery<T> extends undefined | void ? { query?: undefined } : { query: _SmoothieQuery<T> }) &
  (_SmoothieParams<T> extends undefined | void ? { params?: undefined } : { params: _SmoothieParams<T> });

type ToPromise<T> = T extends PromiseLike<unknown> ? T : Promise<T>;

type ClientMethod<T extends (...args: KnownAny[]) => KnownAny, OPTS extends Record<string, KnownAny>> = <R>(
  options: _StaticMethodInput<T> & OPTS extends { body?: undefined | null; query?: undefined; params?: undefined }
    ? void
    : Parameters<T>[0] extends void
      ? void
      : _StaticMethodInput<T> & OPTS
) => R extends object ? Promise<R> : ToPromise<ReturnType<T>>;

export type _SmoothieClient<T, OPTS extends Record<string, KnownAny>> = {
  [K in keyof T]: T[K] extends (...args: KnownAny) => KnownAny ? ClientMethod<T[K], OPTS> : never;
};

export type _SmoothieClientHandler<OPTS extends Record<string, KnownAny> = Record<string, never>, T = KnownAny> = (
  options: {
    name: keyof T;
    httpMethod: HttpMethod;
    getPath: (params: { [key: string]: string }, query: { [key: string]: string }) => string;
    validate: (input: { body?: unknown; query?: unknown }) => void;
  },
  input: {
    body: unknown;
    query: { [key: string]: string };
    params: { [key: string]: string };
  } & OPTS
) => KnownAny;

export type _SmoothieClientOptions = {
  disableClientValidation?: boolean;
  validateOnClient?: (
    input: { body?: unknown; query?: unknown },
    validators: { body?: unknown; query?: unknown }
  ) => unknown;
};
