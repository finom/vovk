import { _VovkSchema as VovkSchema, _VovkController as VovkController, _VovkWorker as VovkWorker } from '../types';

export default function (options: {
  emitSchema?: boolean;
  segmentName?: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  controllers: Record<string, Function>;
  // eslint-disable-next-line @typescript-eslint/ban-types
  workers?: Record<string, Function>;
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
      _handlers: { ...worker._handlers },
    };
  }

  return schema;
}
