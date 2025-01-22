import type { KnownAny } from '../types';

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

export type WorkerPromiseInstanceWithNever<T> = {
  [K in keyof T]: T[K] extends (...args: KnownAny[]) => KnownAny
    ? (...args: Parameters<T[K]>) => ToProperReturnType<ReturnType<T[K]>>
    : never;
};

export type WorkerPromiseInstance<T> = OmitNever<WorkerPromiseInstanceWithNever<T>> & {
  terminate: () => void;
  employ: (w: Worker) => WorkerPromiseInstance<T>;
  fork: (w: Worker) => WorkerPromiseInstance<T>;
  worker: Worker | null;
  _isTerminated?: true;
  [Symbol.dispose]: () => void;
};

export interface WorkerInput {
  methodName: string;
  args: unknown[];
  key: number;
}

export interface WorkerOutput {
  methodName: string;
  result?: unknown;
  error?: unknown;
  done?: true;
  key: number;
}
