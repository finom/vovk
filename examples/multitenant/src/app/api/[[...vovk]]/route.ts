import { initSegment } from 'vovk';
import RootController from '../../../modules/root/root-controller';

export const runtime = 'edge';

const controllers = {
  RootRPC: RootController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({
  emitSchema: true,
  controllers,
});
