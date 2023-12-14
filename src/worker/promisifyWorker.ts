import type { _SmoothieWorkerMetadata as SmoothieWorkerMetadata } from '../types';
import type {
  _WorkerInput as WorkerInput,
  _WorkerOutput as WorkerOutput,
  _WorkerPromiseInstance as WorkerPromiseInstance,
} from './types';

export function _promisifyWorker<T extends object>(w: Worker, givenWorkerService: object): WorkerPromiseInstance<T> {
  const workerService = givenWorkerService as T & SmoothieWorkerMetadata;
  const instance = {} as WorkerPromiseInstance<T>;
  let callsKey = 0;

  if (typeof Worker === 'undefined' || !(w instanceof Worker)) {
    throw new Error('Worker is not provided');
  }

  for (const method of Object.keys(workerService._handlers) as (keyof T & string)[]) {
    const value = workerService[method];
    // @ts-expect-error TODO Fix this
    instance[method] = (...args: Parameters<typeof value>) => {
      return new Promise((resolve, reject) => {
        const key = callsKey;
        callsKey += 1;

        const onError = (e: ErrorEvent) => {
          w.removeEventListener('message', onMessage);
          w.removeEventListener('error', onError);
          reject(e);
        };

        const onMessage = (e: MessageEvent<WorkerOutput>) => {
          console.log('DATA', e.data);
          const { result, error, key: k, method: m } = e.data;
          if (k !== key || m !== method) {
            return;
          }
          w.removeEventListener('message', onMessage);
          w.removeEventListener('error', onError);
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        };

        w.addEventListener('message', onMessage);
        w.addEventListener('error', onError);
        w.postMessage({ key, args, method } satisfies WorkerInput);
      });
    };
  }
  return instance;
}
