import { initVovk } from 'vovk';
import MyWorker from 'src/worker/MyWorker';
import MyInnerWorker from 'src/worker/MyInnerWorker';

const workers = { MyWorker, MyInnerWorker, MyInnerWorkerX: MyInnerWorker };
const controllers = {};

export type Workers = typeof workers;

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initVovk({
  segmentName: 'workers',
  workers,
  controllers,
  onError: (err, req) => {
    // eslint-disable-next-line no-console
    console.log('onError', err.message, req.url);
  },
});
