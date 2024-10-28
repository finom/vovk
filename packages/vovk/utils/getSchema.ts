import {
  _VovkSchema as VovkSchema,
  _VovkController as VovkController,
  _VovkWorker as VovkWorker,
  _StaticClass as StaticClass,
} from '../types';

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
      _controllerName: controllerName,
      _originalControllerName: controller.name,
      _prefix: controller._prefix ?? '',
      _handlers: {
        ...(exposeValidation
          ? controller._handlers
          : Object.fromEntries(
              Object.entries(controller._handlers).map(([key, value]) => [
                key,
                { ...value, clientValidators: undefined },
              ])
            )),
      },
    };
  }

  for (const [workerName, worker] of Object.entries(options.workers ?? {}) as [string, VovkWorker][]) {
    schema.workers[workerName] = {
      _workerName: workerName,
      _originalWorkerName: worker.name,
      _handlers: { ...worker._handlers },
    };
  }

  return schema;
}
