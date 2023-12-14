import type { _KnownAny as KnownAny } from '../types';

type ToPromise<T> = T extends PromiseLike<unknown> ? T : Promise<T>;

export type _WorkerPromiseInstance<T> = {
  [K in keyof T]: T[K] extends (...args: KnownAny[]) => KnownAny
    ? (...args: Parameters<T[K]>) => ToPromise<ReturnType<T[K]>>
    : never;
};

export interface _WorkerInput {
  method: string;
  args: unknown[];
  key: number;
}

export interface _WorkerOutput {
  result?: unknown;
  error?: unknown;
  key: number;
  method: string;
}
