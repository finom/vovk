import type { VovkSchema } from 'vovk';
import { _VovkControllerSchema, _VovkWorkerSchema } from 'vovk/types';
import isEqual from 'lodash/isEqual.js';

interface HandlersDiff {
  nameOfClass: string;
  added: string[];
  removed: string[];
  changed: string[];
}

interface WorkersOrControllersDiff {
  added: string[];
  removed: string[];
  handlers: HandlersDiff[];
}

export interface DiffResult {
  workers: WorkersOrControllersDiff;
  controllers: WorkersOrControllersDiff;
}

export function diffHandlers<T extends _VovkWorkerSchema['_handlers'] | _VovkControllerSchema['_handlers']>(
  oldHandlers: T,
  newHandlers: T,
  nameOfClass: string
): HandlersDiff {
  const added: string[] = [];
  const removed: string[] = [];
  const changed: string[] = []; // Array to store changed handlers

  for (const [handler, newHandler] of Object.entries(newHandlers)) {
    if (!(handler in oldHandlers)) {
      added.push(handler);
    } else if (!isEqual(newHandler, oldHandlers[handler])) {
      changed.push(handler); // Add to changed if handlers are not shallow equal
    }
  }

  for (const [handler] of Object.entries(oldHandlers)) {
    if (!(handler in newHandlers)) {
      removed.push(handler);
    }
  }

  return { nameOfClass, added, removed, changed };
}

export function diffWorkersOrControllers<T extends VovkSchema['controllers'] | VovkSchema['workers']>(
  oldItems: T,
  newItems: T
): WorkersOrControllersDiff {
  const added: string[] = [];
  const removed: string[] = [];
  const handlersDiff: HandlersDiff[] = [];

  for (const [item, newItem] of Object.entries(newItems) as [string, T[keyof T]][]) {
    if (!(item in oldItems)) {
      added.push(item);
    } else {
      const handlers = diffHandlers(oldItems[item]._handlers, newItem._handlers, item);
      if (handlers.added.length || handlers.removed.length || handlers.changed.length) {
        handlersDiff.push(handlers);
      }
    }
  }

  for (const [item] of Object.entries(oldItems)) {
    if (!(item in newItems)) {
      removed.push(item);
    }
  }

  return { added, removed, handlers: handlersDiff };
}

/**
example output:
{
  workers: {
    added: ["WorkerC"],
    removed: ["WorkerA"],
    handlers: []
  },
  controllers: {
    added: ["ControllerC"],
    removed: ["ControllerB"],
    handlers: [
      {
        nameOfClass: "ControllerA",
        added: ["handlerF"],
        removed: [],
        changed: ["handlerD"]
      }
    ]
  }
}
*/
export default function diffSchema(oldJson: VovkSchema, newJson: VovkSchema): DiffResult {
  const workersDiff = diffWorkersOrControllers<VovkSchema['workers']>(oldJson.workers ?? {}, newJson.workers ?? {});
  const controllersDiff = diffWorkersOrControllers<VovkSchema['controllers']>(
    oldJson.controllers ?? {},
    newJson.controllers ?? {}
  );

  return {
    workers: workersDiff,
    controllers: controllersDiff,
  };
}
