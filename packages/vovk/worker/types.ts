import type { _KnownAny as KnownAny } from '../types';

type ToPromise<T> = T extends PromiseLike<unknown> ? T : Promise<T>;
type ToAsyncGenerator<T> =
  T extends AsyncGenerator<unknown, unknown, unknown>
    ? T
    : T extends Generator<infer U, unknown, unknown>
      ? AsyncGenerator<U, unknown, unknown>
      : AsyncGenerator<T, unknown, unknown>;
type ToProperReturnType<T> = T extends Generator<unknown, unknown, unknown> | AsyncGenerator<unknown, unknown, unknown>
  ? ToAsyncGenerator<T>
  : ToPromise<T>;

type OmitNever<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};

export type _WorkerPromiseInstanceWithNever<T> = {
  [K in keyof T]: T[K] extends (...args: KnownAny[]) => KnownAny
    ? (...args: Parameters<T[K]>) => ToProperReturnType<ReturnType<T[K]>>
    : never;
};

export type _WorkerPromiseInstance<T> = OmitNever<_WorkerPromiseInstanceWithNever<T>> & {
  terminate: () => void;
  employ: (w: Worker) => _WorkerPromiseInstance<T>;
  fork: (w: Worker) => _WorkerPromiseInstance<T>;
  _isTerminated?: true;
  [Symbol.dispose]: () => void;
};

export interface _WorkerInput {
  method: string;
  args: unknown[];
  key: number;
}

export interface _WorkerOutput {
  result?: unknown;
  error?: unknown;
  done?: true;
  key: number;
  method: string;
}
