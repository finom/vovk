// importWorker.js
import { parentPort, workerData as wData } from 'node:worker_threads';
import { pathToFileURL } from 'node:url';

void (async () => {
  if (!parentPort) return;
  const workerData = wData as { modulePath: string };
  try {
    // Convert the module path to a file URL
    const moduleUrl = pathToFileURL(workerData.modulePath).href;

    // Dynamically import the module
    const importedModule = (await import(moduleUrl)) as { default: unknown };

    // Send the module's exports back to the main thread
    parentPort?.postMessage({
      success: true,
      exportDefault: importedModule.default,
    });
  } catch (error) {
    // Send the error back to the main thread
    parentPort?.postMessage({
      success: false,
      error: (error as Error).message,
    });
  }
})();
