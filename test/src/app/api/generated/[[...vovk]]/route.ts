import { initVovk } from 'vovk';
import NoValidationControllerOnlyEntityController from '../../../../generated/noValidationControllerOnlyEntity/NoValidationControllerOnlyEntityController';
import NoValidationControllerAndServiceEntityController from '../../../../generated/noValidationControllerAndServiceEntity/NoValidationControllerAndServiceEntityController';
import ZodControllerOnlyEntityController from '../../../../generated/zodControllerOnlyEntity/ZodControllerOnlyEntityController';
import ZodControllerAndServiceEntityController from '../../../../generated/zodControllerAndServiceEntity/ZodControllerAndServiceEntityController';
import YupControllerOnlyEntityController from '../../../../generated/yupControllerOnlyEntity/YupControllerOnlyEntityController';
import YupControllerAndServiceEntityController from '../../../../generated/yupControllerAndServiceEntity/YupControllerAndServiceEntityController';
import DtoControllerOnlyEntityController from '../../../../generated/dtoControllerOnlyEntity/DtoControllerOnlyEntityController';
import DtoControllerAndServiceEntityController from '../../../../generated/dtoControllerAndServiceEntity/DtoControllerAndServiceEntityController';

export const runtime = 'edge';

const controllers = {
  NoValidationControllerOnlyEntityRPC: NoValidationControllerOnlyEntityController,
  NoValidationControllerAndServiceEntityRPC: NoValidationControllerAndServiceEntityController,
  ZodControllerOnlyEntityRPC: ZodControllerOnlyEntityController,
  ZodControllerAndServiceEntityRPC: ZodControllerAndServiceEntityController,
  YupControllerOnlyEntityRPC: YupControllerOnlyEntityController,
  YupControllerAndServiceEntityRPC: YupControllerAndServiceEntityController,
  DtoControllerOnlyEntityRPC: DtoControllerOnlyEntityController,
  DtoControllerAndServiceEntityRPC: DtoControllerAndServiceEntityController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initVovk({
  segmentName: 'generated',
  emitSchema: true,
  controllers,
});
