import { initSegment } from 'vovk';
import CommonController from '../../../../client/CommonController.ts';

const controllers = {
  CommonControllerDifferentFetcherRPC: CommonController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({
  segmentName: 'client2',
  controllers,
  onError: (err, req) => {
    // eslint-disable-next-line no-console
    console.log('onError', err.message, req.url);
  },
});
