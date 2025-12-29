import type { VovkStreamAsyncIterable } from './types';
import type { VovkYieldType } from '../types';

type KnownAny = any; // eslint-disable-line @typescript-eslint/no-explicit-any

type UnionToIntersection<U> = (U extends KnownAny ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

type PromisifyProperties<T> = {
  [K in keyof T]: Promise<T[K]>;
};

type TransformUnionToPromises<T> = PromisifyProperties<UnionToIntersection<T>>;

/**
 * Implements progressive fetching by returning a proxy object where each property is a promise
 * that resolves when the corresponding value is available from the stream.
 * @see https://vovk.dev/jsonlines
 */
export function progressive<T extends (...args: KnownAny[]) => Promise<VovkStreamAsyncIterable<KnownAny>>>(
  fn: T,
  ...args: undefined extends Parameters<T>[0] ? [arg?: Parameters<T>[0]] : [arg: Parameters<T>[0]]
): TransformUnionToPromises<VovkYieldType<T>> {
  const [arg] = args;
  const reg: Record<
    string | symbol,
    {
      resolve: (value: unknown) => void;
      reject: (reason?: unknown) => void;
      promise: Promise<unknown>;
      isSettled: boolean;
    }
  > = {};

  void fn(arg)
    .then(async (result) => {
      for await (const item of result) {
        for (const [key, value] of Object.entries(item)) {
          if (key in reg) {
            if (!reg[key].isSettled) {
              reg[key].isSettled = true;
              reg[key].resolve(value);
            }
          } else {
            const { promise, resolve, reject } = Promise.withResolvers<KnownAny>();
            reg[key] = { resolve, reject, promise, isSettled: true };
            reg[key].resolve(value);
          }
        }
      }

      Object.keys(reg).forEach((key) => {
        if (reg[key].isSettled) return;
        reg[key].isSettled = true;
        reg[key].reject(new Error(`The connection was closed without sending a value for "${key}"`));
      });

      return result;
    })
    .catch((error) => {
      Object.keys(reg).forEach((key) => {
        if (reg[key].isSettled) return;
        reg[key].isSettled = true;
        reg[key].reject(error);
      });

      return error;
    });
  return new Proxy({} as TransformUnionToPromises<VovkYieldType<T>>, {
    get(_target, prop) {
      if (prop in reg) {
        return reg[prop].promise;
      }

      const { promise, resolve, reject } = Promise.withResolvers();
      reg[prop] = { resolve, reject, promise, isSettled: false };
      return promise;
    },
    ownKeys: () => {
      throw new Error('Getting own keys is not possible as they are dynamically created');
    },
  });
}
