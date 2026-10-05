import type { VovkController, VovkHandlerSchema, VovkSegmentSchema } from '../types/core.js';
import { VovkSchemaIdEnum } from '../types/enums.js';
import type { StaticClass } from '../types/utils.js';

// the body's JSON Schema is built here only for its content types, and one that can't be built gives none
const getBodyContentType = (validation: VovkHandlerSchema['validation']) => {
  try {
    return validation?.body?.['x-contentType'];
  } catch {
    return undefined;
  }
};

export async function getControllerSchema(
  controller: VovkController,
  rpcModuleName: string,
  exposeValidation: boolean
) {
  // hidden validation keeps the declared content types, the clients encode a body by them
  const handlers = exposeValidation
    ? (controller._handlers ?? {})
    : Object.fromEntries(
        Object.entries(controller._handlers ?? {}).map(([key, { validation, ...value }]) => {
          const contentType = getBodyContentType(validation);
          return [key, contentType ? { ...value, validation: { body: { 'x-contentType': contentType } } } : value];
        })
      );

  return {
    rpcModuleName,
    originalControllerName: controller.name,
    prefix: controller._prefix ?? '',
    handlers,
  };
}

export async function getSchema(options: {
  emitSchema?: boolean;
  segmentName?: string;
  controllers: Record<string, StaticClass>;
  exposeValidation?: boolean;
}) {
  const exposeValidation = options?.exposeValidation ?? true;
  const emitSchema = options.emitSchema ?? true;
  const schema: VovkSegmentSchema = {
    $schema: VovkSchemaIdEnum.SEGMENT,
    emitSchema,
    segmentName: options.segmentName ?? '',
    segmentType: 'segment',
    controllers: {},
  };

  if (!emitSchema) return schema;

  for (const [rpcModuleName, controller] of Object.entries(options.controllers ?? {}) as [string, VovkController][]) {
    schema.controllers[rpcModuleName] = await getControllerSchema(controller, rpcModuleName, exposeValidation);
  }

  return schema;
}
