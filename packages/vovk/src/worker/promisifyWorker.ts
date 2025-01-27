import type { VovkWorkerSchema } from '../types';
import type { WorkerInput, WorkerOutput, WorkerPromiseInstance } from './types';

export function promisifyWorker<T extends object>(
  currentWorker: Worker | null,
  workerSchema: object
): WorkerPromiseInstance<T> {
  if (!workerSchema) throw new Error('Worker schema is not provided');
  const schema = workerSchema as T & VovkWorkerSchema;
  const instance = {
    worker: currentWorker,
  } as WorkerPromiseInstance<T>;
  let callsKey = 0;

  instance.terminate = () => {
    if (instance._isTerminated) return;
    instance._isTerminated = true;
    instance.worker?.terminate();
    instance.worker = null;
  };

  instance.employ = (worker: Worker) => {
    if (instance._isTerminated) return instance;
    instance._isTerminated = true;
    instance.worker = worker;
    return instance;
  };

  instance.fork = (worker: Worker) => promisifyWorker<T>(worker, schema);

  for (const methodName of Object.keys(schema.handlers) as (keyof T & string)[]) {
    const { isGenerator } = schema.handlers[methodName];

    if (isGenerator) {
      const method = (...args: unknown[]) => {
        const key = callsKey;
        callsKey += 1;
        return {
          async *[Symbol.asyncIterator]() {
            if (!instance.worker) {
              throw new Error('Worker is not provided or terminated');
            }
            const w = instance.worker;
            const messageQueue: WorkerOutput[] = [];
            let messageResolver: ((message: WorkerOutput) => void) | null = null;

            const onMessage = (e: MessageEvent<WorkerOutput>) => {
              const { methodName: m, key: k } = e.data;
              if (k !== key || m !== methodName) {
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

            w.postMessage({ key, args, methodName } satisfies WorkerInput);

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

      // @ts-expect-error TODO
      instance[methodName] = method;
    } else {
      const method = (...args: unknown[]) => {
        if (!instance.worker) {
          throw new Error('Worker is not provided or terminated');
        }
        const w = instance.worker;
        return new Promise((resolve, reject) => {
          const key = callsKey;
          callsKey += 1;

          const onError = (e: ErrorEvent) => {
            w.removeEventListener('message', onMessage);
            w.removeEventListener('error', onError);
            reject(e);
          };

          const onMessage = (e: MessageEvent<WorkerOutput>) => {
            const { result, error, key: k, methodName: m } = e.data;
            if (k !== key || m !== methodName) {
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
          w.postMessage({ key, args, methodName } satisfies WorkerInput);
        });
      };

      // @ts-expect-error TODO
      instance[methodName] = method;
    }
  }
  return instance;
}
