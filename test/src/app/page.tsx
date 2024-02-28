'use client';
import { useEffect } from 'react';
import { MyWorker as MyWorkerPromisified } from 'vovk-client';
import { promisifyWorker } from '../../../src/worker';
import metadata from '../vovk-metadata.json' assert { type: 'json' };
import MyWorker from '../worker/MyWorker';

export default function Home() {
  useEffect(() => {
    if (typeof Worker === 'undefined') return;
    // eslint-disable-next-line no-undef
    const win = window as unknown as {
      metadataWorker: typeof metadataWorker;
      standaloneWorker: typeof standaloneWorker;
      MyWorkerPromisified: typeof MyWorkerPromisified;
      isTerminated: boolean;
    };
    if (win.metadataWorker) return;

    MyWorkerPromisified.use(new Worker(new URL('../worker/MyWorker.ts', import.meta.url)));

    const metadataWorker = promisifyWorker<typeof MyWorker>(
      new Worker(new URL('../worker/MyWorker.ts', import.meta.url)),
      metadata.workers.MyWorker
    );

    const standaloneWorker = promisifyWorker<typeof MyWorker>(
      new Worker(new URL('../worker/MyWorker.ts', import.meta.url)),
      MyWorker
    );

    const toBeTerminated = promisifyWorker<typeof MyWorker>(
      new Worker(new URL('../worker/MyWorker.ts', import.meta.url)),
      MyWorker
    );

    toBeTerminated.terminate();

    win.metadataWorker = metadataWorker;
    win.standaloneWorker = standaloneWorker;
    win.MyWorkerPromisified = MyWorkerPromisified;

    win.isTerminated = toBeTerminated._isTerminated ?? false;
  }, []);

  return <main>Hello World</main>;
}
