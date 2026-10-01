import { initSegment } from 'vovk';
import ClientSweepController from '../../../../client/client-sweep-controller.ts';

const controllers = {
  ClientSweepRPC: ClientSweepController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({
  segmentName: 'client-sweep',
  emitSchema: true,
  controllers,
});
