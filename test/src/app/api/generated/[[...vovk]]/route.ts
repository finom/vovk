import { initSegment } from 'vovk';
import NoValidationControllerOnlyEntityController from '../../../../modules/generated/no-validation-controller-only-entity/no-validation-controller-only-entity-controller.ts';
import NoValidationControllerAndServiceEntityController from '../../../../modules/generated/no-validation-controller-and-service-entity/no-validation-controller-and-service-entity-controller.ts';
import ZodControllerOnlyEntityController from '../../../../modules/generated/zod-controller-only-entity/zod-controller-only-entity-controller.ts';
import ZodControllerAndServiceEntityController from '../../../../modules/generated/zod-controller-and-service-entity/zod-controller-and-service-entity-controller.ts';
import ValibotControllerOnlyEntityController from '../../../../modules/generated/valibot-controller-only-entity/valibot-controller-only-entity-controller.ts';
import ValibotControllerAndServiceEntityController from '../../../../modules/generated/valibot-controller-and-service-entity/valibot-controller-and-service-entity-controller.ts';
import ArktypeControllerOnlyEntityController from '../../../../modules/generated/arktype-controller-only-entity/arktype-controller-only-entity-controller.ts';
import ArktypeControllerAndServiceEntityController from '../../../../modules/generated/arktype-controller-and-service-entity/arktype-controller-and-service-entity-controller.ts';

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
