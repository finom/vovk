// importUncachedModule.js
import { Worker } from 'node:worker_threads';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import './importUncachedModuleWorker.mjs'; // required for TS compilation

function importUncachedModule<T>(modulePath: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Resolve the path to the worker script
    const workerPath = path.resolve(__dirname, 'importUncachedModuleWorker.mjs');

    // Initialize the worker thread
    const worker = new Worker(workerPath, {
      workerData: { modulePath },
    });

    // Listen for messages from the worker
    worker.on('message', (d) => {
      const data = d as { success?: boolean; exportDefault?: unknown; error?: string };
      if (data.success) {
        resolve(data.exportDefault as T);
      } else {
        reject(new Error(data.error));
      }
      void worker.terminate();
    });

    // Handle errors from the worker
    worker.on('error', (err) => {
      reject(err);
      void worker.terminate();
    });

    // Handle worker exit
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

export default importUncachedModule;
