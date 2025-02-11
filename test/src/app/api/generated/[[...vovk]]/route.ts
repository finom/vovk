import { initVovk } from 'vovk';
import NoValidationControllerOnlyEntityController from '../../../../modules/generated/noValidationControllerOnlyEntity/NoValidationControllerOnlyEntityController';
import NoValidationControllerAndServiceEntityController from '../../../../modules/generated/noValidationControllerAndServiceEntity/NoValidationControllerAndServiceEntityController';
import ZodControllerOnlyEntityController from '../../../../modules/generated/zodControllerOnlyEntity/ZodControllerOnlyEntityController';
import ZodControllerAndServiceEntityController from '../../../../modules/generated/zodControllerAndServiceEntity/ZodControllerAndServiceEntityController';
import YupControllerOnlyEntityController from '../../../../modules/generated/yupControllerOnlyEntity/YupControllerOnlyEntityController';
import YupControllerAndServiceEntityController from '../../../../modules/generated/yupControllerAndServiceEntity/YupControllerAndServiceEntityController';
import DtoControllerOnlyEntityController from '../../../../modules/generated/dtoControllerOnlyEntity/DtoControllerOnlyEntityController';
import DtoControllerAndServiceEntityController from '../../../../modules/generated/dtoControllerAndServiceEntity/DtoControllerAndServiceEntityController';

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
