'use client';
import { useEffect } from 'react';
import { MyWorkerWPC } from '../../.vovk-client/client';
import { promisifyWorker } from '../../../packages/vovk/worker';
import segmentSchema from '.vovk-schema';
import MyWorker from '../worker/MyWorker';
import { _VovkWorkerSchema } from 'vovk/types';

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

    const schemaWorker = promisifyWorker<typeof MyWorker>(
      new Worker(new URL('../worker/MyWorker.ts', import.meta.url)),
      segmentSchema.workers.workers.MyWorkerWPC
    );

    const schema: _VovkWorkerSchema = {
      workerName: 'MyWorker',
      originalWorkerName: 'MyWorker',
      handlers: (MyWorker as unknown as { _handlers: _VovkWorkerSchema['handlers'] })._handlers 
    };

    const standaloneWorker = promisifyWorker<typeof MyWorker>(
      new Worker(new URL('../worker/MyWorker.ts', import.meta.url)),
      schema
    );

    const toBeTerminated = promisifyWorker<typeof MyWorker>(
      new Worker(new URL('../worker/MyWorker.ts', import.meta.url)),
      schema
    );

    toBeTerminated.terminate();

    win.schemaWorker = schemaWorker;
    win.standaloneWorker = standaloneWorker;
    win.MyWorkerWPC = MyWorkerWPC;

    win.isTerminated = toBeTerminated._isTerminated ?? false;
  }, []);

  return <main>Hello World</main>;
}
