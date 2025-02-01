import type { VovkSchema, VovkController, VovkWorker, StaticClass } from '../types';

export default function getSchema(options: {
  emitSchema?: boolean;
  segmentName?: string;
  controllers: Record<string, StaticClass>;
  workers?: Record<string, StaticClass>;
  exposeValidation?: boolean;
}) {
  const exposeValidation = options?.exposeValidation ?? true;
  const emitSchema = options.emitSchema ?? true;
  const schema: VovkSchema = {
    emitSchema,
    segmentName: options.segmentName ?? '',
    controllers: {},
    workers: {},
  };

  if (!emitSchema) return schema;

  for (const [controllerName, controller] of Object.entries(options.controllers) as [string, VovkController][]) {
    schema.controllers[controllerName] = {
      controllerName: controllerName,
      originalControllerName: controller.name,
      prefix: controller._prefix ?? '',
      handlers: {
        ...(exposeValidation
          ? controller._handlers
          : Object.fromEntries(
              Object.entries(controller._handlers ?? {}).map(([key, value]) => [key, { ...value, validation: {} }])
            )),
      },
    };
  }

  for (const [workerName, worker] of Object.entries(options.workers ?? {}) as [string, VovkWorker][]) {
    schema.workers[workerName] = {
      workerName,
      originalWorkerName: worker.name,
      handlers: { ...worker._handlers },
    };
  }

  return schema;
}
