import type { _VovkWorkerMetadata as VovkWorkerMetadata } from '../types';
import type {
  _WorkerInput as WorkerInput,
  _WorkerOutput as WorkerOutput,
  _WorkerPromiseInstance as WorkerPromiseInstance,
} from './types';

export function _promisifyWorker<T extends object>(
  currentWorker: Worker | null,
  givenWorkerService: object
): WorkerPromiseInstance<T> {
  if (!givenWorkerService) throw new Error('Worker metadata is not provided');
  const workerService = givenWorkerService as T & VovkWorkerMetadata;
  const instance = {} as WorkerPromiseInstance<T>;
  let callsKey = 0;

  instance.terminate = () => {
    if (instance._isTerminated) return;
    instance._isTerminated = true;
    currentWorker?.terminate();
    currentWorker = null;
  };

  instance.use = (worker: Worker) => {
    if (instance._isTerminated) return instance;
    instance._isTerminated = true;
    currentWorker = worker;
    return instance;
  };

  instance.fork = (worker: Worker) => {
    const forked = _promisifyWorker<T>(worker, givenWorkerService);
    return forked.use(worker);
  };

  if (typeof Symbol.dispose !== 'symbol') {
    Object.defineProperty(Symbol, 'dispose', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: Symbol.for('dispose'),
    });
  }

  instance[Symbol.dispose] = () => instance.terminate();

  for (const method of Object.keys(workerService._handlers) as (keyof T & string)[]) {
    const { isGenerator } = workerService._handlers[method];
    const value = workerService[method];

    if (isGenerator) {
      // @ts-expect-error TODO Fix this
      instance[method] = (...args: Parameters<typeof value>) => {
        const key = callsKey;
        callsKey += 1;
        return {
          async *[Symbol.asyncIterator]() {
            if (!currentWorker) {
              throw new Error('Worker is not provided or terminated');
            }
            const w = currentWorker;
            const messageQueue: WorkerOutput[] = [];
            let messageResolver: ((message: WorkerOutput) => void) | null = null;

            const onMessage = (e: MessageEvent<WorkerOutput>) => {
              const { method: m, key: k } = e.data;
              if (k !== key || m !== method) {
                return;
              }
              if (messageResolver) {
                messageResolver(e.data);
                messageResolver = null;
              } else {
                messageQueue.push(e.data);
              }
            };

            const onError = (e: ErrorEvent) => {
              if (messageResolver) {
                messageResolver({ error: e.error } as WorkerOutput);
                messageResolver = null;
              } else {
                messageQueue.push({ error: e.error } as WorkerOutput);
              }

              w.removeEventListener('message', onMessage);
              w.removeEventListener('error', onError);
              throw e.error;
            };

            w.addEventListener('message', onMessage);
            w.addEventListener('error', onError);

            w.postMessage({ key, args, method } satisfies WorkerInput);

            try {
              while (true) {
                let message: WorkerOutput | null = null;
                if (messageQueue.length > 0) {
                  message = messageQueue.shift()!;
                } else {
                  message = await new Promise<WorkerOutput>((resolve) => {
                    messageResolver = resolve;
                  });
                }

                const { result, error, done } = message;

                if (error) {
                  throw error;
                }

                if (done) {
                  break;
                }

                yield result;
              }

              w.removeEventListener('message', onMessage);
              w.removeEventListener('error', onError);
            } catch (e) {
              w.removeEventListener('message', onMessage);
              w.removeEventListener('error', onError);
              throw e;
            }
          },
        };
      };
    } else {
      // @ts-expect-error TODO Fix this
      instance[method] = (...args: Parameters<typeof value>) => {
        if (!currentWorker) {
          throw new Error('Worker is not provided or terminated');
        }
        const w = currentWorker;
        return new Promise((resolve, reject) => {
          const key = callsKey;
          callsKey += 1;

          const onError = (e: ErrorEvent) => {
            w.removeEventListener('message', onMessage);
            w.removeEventListener('error', onError);
            reject(e);
          };

          const onMessage = (e: MessageEvent<WorkerOutput>) => {
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
  }
  return instance;
}
