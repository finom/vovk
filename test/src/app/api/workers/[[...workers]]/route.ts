import { initVovk } from 'vovk';
import MyWorker from 'src/worker/MyWorker';
import MyInnerWorker from 'src/worker/MyInnerWorker';

const workers = { 
  MyWorkerWPC: MyWorker,
  MyInnerWorkerWPC: MyInnerWorker,
};
const controllers = {};

export type Workers = typeof workers;

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initVovk({
  emitSchema: true,
  segmentName: 'workers',
  workers,
  controllers,
  onError: (err, req) => {
    // eslint-disable-next-line no-console
    console.log('onError', err.message, req.url);
  },
});
