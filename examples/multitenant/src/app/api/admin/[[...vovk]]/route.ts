import { initSegment } from 'vovk';
import AdminController from '../../../../modules/admin/admin/admin-controller';

const controllers = {
  AdminRPC: AdminController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({
  segmentName: 'admin',
  emitSchema: true,
  controllers,
});
