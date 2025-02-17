import type { VovkSegmentSchema, VovkController, StaticClass } from '../types';

export function getControllerSchema(controller: VovkController, controllerName: string, exposeValidation: boolean) {
  return {
    controllerName,
    originalControllerName: controller.name,
    prefix: controller._prefix ?? '',
    handlers: {
      ...(exposeValidation
        ? controller._handlers
        : Object.fromEntries(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            Object.entries(controller._handlers ?? {}).map(([key, { validation: _v, ...value }]) => [key, value])
          )),
    },
  };
}

export default function getSchema(options: {
  emitSchema?: boolean;
  segmentName?: string;
  controllers: Record<string, StaticClass>;
  exposeValidation?: boolean;
}) {
  const exposeValidation = options?.exposeValidation ?? true;
  const emitSchema = options.emitSchema ?? true;
  const schema: VovkSegmentSchema = {
    emitSchema,
    segmentName: options.segmentName ?? '',
    controllers: {},
  };

  if (!emitSchema) return schema;

  for (const [controllerName, controller] of Object.entries(options.controllers) as [string, VovkController][]) {
    schema.controllers[controllerName] = getControllerSchema(controller, controllerName, exposeValidation);
  }

  return schema;
}
