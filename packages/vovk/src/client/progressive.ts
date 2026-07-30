import type { VovkStreamAsyncIterable } from '../types/client.js';
import type { VovkYieldType } from '../types/inference.js';
import type { KnownAny } from '../types/utils.js';

type UnionToIntersection<U> = (U extends KnownAny ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

type PromisifyProperties<T> = {
  [K in keyof T]: Promise<T[K]>;
};

type TransformUnionToPromises<T> = PromisifyProperties<UnionToIntersection<T>>;

/** Proxy object where each property is a promise resolving once the value arrives from the stream. @see https://vovk.dev/jsonlines */
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
  let finalState: { type: 'done' } | { type: 'error'; error: unknown } | null = null;

  const missingKeyError = (key: string) => new Error(`The connection was closed without sending a value for "${key}"`);

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

      finalState = { type: 'done' };

      Object.keys(reg).forEach((key) => {
        if (reg[key].isSettled) return;
        reg[key].isSettled = true;
        reg[key].reject(missingKeyError(key));
      });

      return result;
    })
    .catch((error) => {
      finalState = { type: 'error', error };

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

      // symbols and a non-yielded then are inspection or await probes, not stream keys
      if (typeof prop === 'symbol' || prop === 'then') {
        return undefined;
      }

      const { promise, resolve, reject } = Promise.withResolvers();
      reg[prop] = { resolve, reject, promise, isSettled: false };

      // the stream already finished, settle immediately instead of hanging forever
      if (finalState) {
        reg[prop].isSettled = true;
        promise.catch(() => {});
        reject(finalState.type === 'error' ? finalState.error : missingKeyError(prop));
      }

      return promise;
    },
    has: (_target, prop) => prop in reg,
    ownKeys: () => Reflect.ownKeys(reg),
    getOwnPropertyDescriptor: (_target, prop) =>
      prop in reg ? { enumerable: true, configurable: true, value: reg[prop].promise } : undefined,
  });
}
