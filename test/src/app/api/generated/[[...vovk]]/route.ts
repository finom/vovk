import { initVovk } from 'vovk';
import NoValidationControllerOnlyEntityController from '../../../../generated/noValidationControllerOnlyEntity/NoValidationControllerOnlyEntityController';
import NoValidationControllerServiceAndWorkerEntityController from '../../../../generated/noValidationControllerServiceAndWorkerEntity/NoValidationControllerServiceAndWorkerEntityController';
import NoValidationControllerServiceAndWorkerEntityWorker from '../../../../generated/noValidationControllerServiceAndWorkerEntity/NoValidationControllerServiceAndWorkerEntityWorker';
import ZodControllerOnlyEntityController from '../../../../generated/zodControllerOnlyEntity/ZodControllerOnlyEntityController';
import ZodControllerAndServiceEntityController from '../../../../generated/zodControllerAndServiceEntity/ZodControllerAndServiceEntityController';
import YupControllerOnlyEntityController from '../../../../generated/yupControllerOnlyEntity/YupControllerOnlyEntityController';
import YupControllerAndServiceEntityController from '../../../../generated/yupControllerAndServiceEntity/YupControllerAndServiceEntityController';
import DtoControllerOnlyEntityController from '../../../../generated/dtoControllerOnlyEntity/DtoControllerOnlyEntityController';
import DtoControllerAndServiceEntityController from '../../../../generated/dtoControllerAndServiceEntity/DtoControllerAndServiceEntityController';

const controllers = {
  NoValidationControllerOnlyEntityRPC: NoValidationControllerOnlyEntityController,
  NoValidationControllerServiceAndWorkerEntityRPC: NoValidationControllerServiceAndWorkerEntityController,
  ZodControllerOnlyEntityRPC: ZodControllerOnlyEntityController,
  ZodControllerAndServiceEntityRPC: ZodControllerAndServiceEntityController,
  YupControllerOnlyEntityRPC: YupControllerOnlyEntityController,
  YupControllerAndServiceEntityRPC: YupControllerAndServiceEntityController,
  DtoControllerOnlyEntityRPC: DtoControllerOnlyEntityController,
  DtoControllerAndServiceEntityRPC: DtoControllerAndServiceEntityController,
};
const workers = {
  NoValidationControllerServiceAndWorkerEntityWPC: NoValidationControllerServiceAndWorkerEntityWorker,
};

export type Controllers = typeof controllers;
export type Workers = typeof workers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initVovk({
  segmentName: 'generated',
  emitSchema: true,
  workers,
  controllers,
});
