import type { _SmoothieWorkerMetadata as SmoothieWorkerMetadata } from '../types';
import type { _WorkerInput as WorkerInput, _WorkerOutput as WorkerOutput } from './types';

export function _worker() {
  return (t: object) => {
    const target = t as Record<string, (...args: unknown[]) => unknown> & SmoothieWorkerMetadata;
    target._handlers = {};

    for (const key of Object.getOwnPropertyNames(target)) {
      if (typeof target[key] === 'function') {
        target._handlers[key] = {};
      }
    }

    // eslint-disable-next-line no-undef
    if (typeof self === 'undefined') return; // no-op in non-worker environment

    // eslint-disable-next-line no-undef
    const w = self as unknown as Worker;

    w.onmessage = async (evt: MessageEvent<WorkerInput>) => {
      const { method, args, key } = evt.data;
      try {
        const result = await target[method](...args);
        w.postMessage({ result, key, method } satisfies WorkerOutput);
      } catch (e) {
        w.postMessage({ error: e, key, method } satisfies WorkerOutput);
      }
    };
  };
}
