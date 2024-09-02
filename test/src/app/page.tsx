'use client';
import { useEffect } from 'react';
import { MyWorker as MyWorkerPromisified } from '../../.vovk-client/client';
import { promisifyWorker } from '../../../packages/vovk/worker';
import segmentSchema from '.vovk-schema';
import MyWorker from '../worker/MyWorker';

export default function Home() {
  useEffect(() => {
    if (typeof Worker === 'undefined') return;
    // eslint-disable-next-line no-undef
    const win = window as unknown as {
      schemaWorker: typeof schemaWorker;
      standaloneWorker: typeof standaloneWorker;
      MyWorkerPromisified: typeof MyWorkerPromisified;
      isTerminated: boolean;
    };
    if (win.schemaWorker) return;

    MyWorkerPromisified.employ(new Worker(new URL('../worker/MyWorker.ts', import.meta.url)));

    const schemaWorker = promisifyWorker<typeof MyWorker>(
      new Worker(new URL('../worker/MyWorker.ts', import.meta.url)),
      segmentSchema.workers.workers.MyWorker
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

    win.schemaWorker = schemaWorker;
    win.standaloneWorker = standaloneWorker;
    win.MyWorkerPromisified = MyWorkerPromisified;

    win.isTerminated = toBeTerminated._isTerminated ?? false;
  }, []);

  return <main>Hello World</main>;
}
