import { initSegment } from 'vovk';
import RustSweepController from '../../../../client/rust-sweep-controller.ts';

const controllers = {
  RustSweepRPC: RustSweepController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({
  segmentName: 'rust-sweep',
  emitSchema: true,
  controllers,
});
