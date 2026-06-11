import { Worker } from 'node:worker_threads';

export async function importFresh<T>(modulePath: string, keys: (keyof T)[]): Promise<T> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      `
      import { parentPort, workerData } from 'worker_threads';
      
      import('${modulePath}').then(module => {
        const { keys } = workerData;
        
        // Pick only the specified keys from the module
        const picked = Object.fromEntries(
          Object.entries(module).filter(([key]) => keys.includes(key))
        );
        parentPort.postMessage(picked);
      }).catch(error => {
        throw error;
      });
    `,
      {
        eval: true,
        workerData: { keys },
      }
    );

    worker.on('message', resolve);
    worker.on('error', reject);
  });
}
