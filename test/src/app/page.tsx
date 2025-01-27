'use client';
import { useEffect } from 'react';
import { MyWorkerWPC } from 'vovk-client';
import { createWPC, type VovkWorkerSchema } from 'vovk';
import segmentSchema from '.vovk-schema';
import MyWorker from '../worker/MyWorker';

export default function Home() {
  useEffect(() => {
    if (typeof Worker === 'undefined') return;

    const win = window as unknown as {
      schemaWorker: typeof schemaWorker;
      standaloneWorker: typeof standaloneWorker;
      MyWorkerWPC: typeof MyWorkerWPC;
      isTerminated: boolean;
    };
    if (win.schemaWorker) return;

    MyWorkerWPC.employ(new Worker(new URL('../worker/MyWorker.ts', import.meta.url)));

    const schemaWorker = createWPC<typeof MyWorker>(
      segmentSchema.workers.workers.MyWorkerWPC,
      new Worker(new URL('../worker/MyWorker.ts', import.meta.url)),
    );

    const schema: VovkWorkerSchema = {
      workerName: 'MyWorker',
      originalWorkerName: 'MyWorker',
      handlers: (MyWorker as unknown as { _handlers: VovkWorkerSchema['handlers'] })._handlers,
    };

    const standaloneWorker = createWPC<typeof MyWorker>(
      schema,
      new Worker(new URL('../worker/MyWorker.ts', import.meta.url)),
    );

    const toBeTerminated = createWPC<typeof MyWorker>(
      schema,
      new Worker(new URL('../worker/MyWorker.ts', import.meta.url)),
    );

    toBeTerminated.terminate();

    win.schemaWorker = schemaWorker;
    win.standaloneWorker = standaloneWorker;
    win.MyWorkerWPC = MyWorkerWPC;

    win.isTerminated = toBeTerminated._isTerminated ?? false;
  }, []);

  return <main>Hello World</main>;
}
