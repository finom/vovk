import { initSegment } from 'vovk';
import StreamController from '../../../modules/stream/stream-controller';
import UserController from '../../../modules/user/user-controller';

export const runtime = 'edge';

const controllers = {
  UserRPC: UserController,
  StreamRPC: StreamController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({
  emitSchema: true,
  controllers,
  onError: console.error,
});
