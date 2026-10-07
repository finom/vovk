import { initSegment } from 'vovk';
import CustomerController from '../../../../modules/customer/customer/customer-controller';

const controllers = {
  CustomerRPC: CustomerController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({
  segmentName: 'customer',
  emitSchema: true,
  controllers,
});
