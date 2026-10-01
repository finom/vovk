import { initSegment } from 'vovk';
import CustomerProController from '../../../../../modules/customer/pro/customer-pro/customer-pro-controller';

export const runtime = 'edge';

const controllers = {
  CustomerProRPC: CustomerProController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({
  segmentName: 'customer/pro',
  emitSchema: true,
  controllers,
});
