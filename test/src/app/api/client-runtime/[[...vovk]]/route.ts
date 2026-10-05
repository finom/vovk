import { initSegment } from 'vovk';
import ClientRuntimeController from '../../../../client/client-runtime-controller.ts';

const controllers = {
  ClientRuntimeRPC: ClientRuntimeController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({
  segmentName: 'client-runtime',
  emitSchema: true,
  controllers,
});
