import { initSegment } from 'vovk';
import NoValidationControllerOnlyEntityController from '../../../../modules/generated/noValidationControllerOnlyEntity/NoValidationControllerOnlyEntityController.ts';
import NoValidationControllerAndServiceEntityController from '../../../../modules/generated/noValidationControllerAndServiceEntity/NoValidationControllerAndServiceEntityController.ts';
import ZodControllerOnlyEntityController from '../../../../modules/generated/zodControllerOnlyEntity/ZodControllerOnlyEntityController.ts';
import ZodControllerAndServiceEntityController from '../../../../modules/generated/zodControllerAndServiceEntity/ZodControllerAndServiceEntityController.ts';
import ValibotControllerOnlyEntityController from '../../../../modules/generated/valibotControllerOnlyEntity/ValibotControllerOnlyEntityController.ts';
import ValibotControllerAndServiceEntityController from '../../../../modules/generated/valibotControllerAndServiceEntity/ValibotControllerAndServiceEntityController.ts';
import ArktypeControllerOnlyEntityController from '../../../../modules/generated/arktypeControllerOnlyEntity/ArktypeControllerOnlyEntityController.ts';
import ArktypeControllerAndServiceEntityController from '../../../../modules/generated/arktypeControllerAndServiceEntity/ArktypeControllerAndServiceEntityController.ts';

const controllers = {
  NoValidationControllerOnlyEntityRPC: NoValidationControllerOnlyEntityController,
  NoValidationControllerAndServiceEntityRPC: NoValidationControllerAndServiceEntityController,
  ZodControllerOnlyEntityRPC: ZodControllerOnlyEntityController,
  ZodControllerAndServiceEntityRPC: ZodControllerAndServiceEntityController,
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
