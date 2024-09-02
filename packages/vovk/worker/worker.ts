import type { _VovkWorkerSchema as VovkWorkerSchema } from '../types';
import type { _WorkerInput as WorkerInput, _WorkerOutput as WorkerOutput } from './types';

export function _worker() {
  return (t: object) => {
    const target = t as Record<
      string,
      (
        ...args: unknown[]
      ) => Iterable<unknown> | AsyncIterable<unknown> | Promise<Iterable<unknown> | AsyncIterable<unknown>>
    > &
      VovkWorkerSchema;
    target._handlers = {};

    // TODO: Experimental: You can pass Worker Service instead of schema to prommisify worker
    for (const key of Object.getOwnPropertyNames(target)) {
      const member = target[key];
      if (typeof member === 'function') {
        const prototype = Object.getPrototypeOf(member) as unknown;
        const isGenerator =
          prototype === Object.getPrototypeOf(function* () {}) ||
          prototype === Object.getPrototypeOf(async function* () {});
        target._handlers[key] = {};

        if (isGenerator) {
          target._handlers[key].isGenerator = true;
        }
      }
    }

    if (typeof self === 'undefined') return; // no-op in non-worker environment

    // eslint-disable-next-line no-undef
    const w = self as unknown as Worker;

    w.onmessage = async (evt: MessageEvent<WorkerInput>) => {
      const { method, args, key } = evt.data;
      try {
        const result = await target[method](...args);

        if (result && typeof result === 'object' && 'next' in result && typeof result.next === 'function') {
          const iterable = result as Iterable<unknown> | AsyncIterable<unknown>;
          for await (const result of iterable) {
            w.postMessage({ result, key, method } satisfies WorkerOutput);
          }
          w.postMessage({ done: true, key, method } satisfies WorkerOutput);
        } else {
          w.postMessage({ result, key, method } satisfies WorkerOutput);
        }
      } catch (e) {
        w.postMessage({ error: e, key, method } satisfies WorkerOutput);
      }
    };
  };
}
