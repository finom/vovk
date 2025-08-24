import { initSegment } from 'vovk';
import NoValidationControllerOnlyEntityController from '../../../../modules/generated/noValidationControllerOnlyEntity/NoValidationControllerOnlyEntityController.ts';
import NoValidationControllerAndServiceEntityController from '../../../../modules/generated/noValidationControllerAndServiceEntity/NoValidationControllerAndServiceEntityController.ts';
import ZodControllerOnlyEntityController from '../../../../modules/generated/zodControllerOnlyEntity/ZodControllerOnlyEntityController.ts';
import ZodControllerAndServiceEntityController from '../../../../modules/generated/zodControllerAndServiceEntity/ZodControllerAndServiceEntityController.ts';
import YupControllerOnlyEntityController from '../../../../modules/generated/yupControllerOnlyEntity/YupControllerOnlyEntityController.ts';
import YupControllerAndServiceEntityController from '../../../../modules/generated/yupControllerAndServiceEntity/YupControllerAndServiceEntityController.ts';
import DtoControllerOnlyEntityController from '../../../../modules/generated/dtoControllerOnlyEntity/DtoControllerOnlyEntityController.ts';
import DtoControllerAndServiceEntityController from '../../../../modules/generated/dtoControllerAndServiceEntity/DtoControllerAndServiceEntityController.ts';
import ValibotControllerOnlyEntityController from '../../../../modules/generated/valibotControllerOnlyEntity/ValibotControllerOnlyEntityController.ts';
import ValibotControllerAndServiceEntityController from '../../../../modules/generated/valibotControllerAndServiceEntity/ValibotControllerAndServiceEntityController.ts';
import ArktypeControllerOnlyEntityController from '../../../../modules/generated/arktypeControllerOnlyEntity/ArktypeControllerOnlyEntityController.ts';
import ArktypeControllerAndServiceEntityController from '../../../../modules/generated/arktypeControllerAndServiceEntity/ArktypeControllerAndServiceEntityController.ts';

const controllers = {
  NoValidationControllerOnlyEntityRPC: NoValidationControllerOnlyEntityController,
  NoValidationControllerAndServiceEntityRPC: NoValidationControllerAndServiceEntityController,
  ZodControllerOnlyEntityRPC: ZodControllerOnlyEntityController,
  ZodControllerAndServiceEntityRPC: ZodControllerAndServiceEntityController,
  YupControllerOnlyEntityRPC: YupControllerOnlyEntityController,
  YupControllerAndServiceEntityRPC: YupControllerAndServiceEntityController,
  DtoControllerOnlyEntityRPC: DtoControllerOnlyEntityController,
  DtoControllerAndServiceEntityRPC: DtoControllerAndServiceEntityController,
  ValibotControllerOnlyEntityRPC: ValibotControllerOnlyEntityController,
  ValibotControllerAndServiceEntityRPC: ValibotControllerAndServiceEntityController,
  ArktypeControllerOnlyEntityRPC: ArktypeControllerOnlyEntityController,
  ArktypeControllerAndServiceEntityRPC: ArktypeControllerAndServiceEntityController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({
  segmentName: 'generated',
  emitSchema: true,
  controllers,
});
