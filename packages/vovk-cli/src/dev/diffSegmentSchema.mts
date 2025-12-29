import type { VovkControllerSchema, VovkSegmentSchema } from 'vovk/internal';
import isEqual from 'lodash/isEqual.js';

interface HandlersDiff {
  nameOfClass: string;
  added: string[];
  removed: string[];
  changed: string[];
}

interface ControllersDiff {
  added: string[];
  removed: string[];
  handlers: HandlersDiff[];
}

export interface DiffResult {
  controllers: ControllersDiff;
}

export function diffHandlers<T extends VovkControllerSchema['handlers']>(
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

export function diffControllers<T extends VovkSegmentSchema['controllers']>(oldItems: T, newItems: T): ControllersDiff {
  const added: string[] = [];
  const removed: string[] = [];
  const handlersDiff: HandlersDiff[] = [];

  for (const [item, newItem] of Object.entries(newItems) as [string, T[keyof T]][]) {
    if (!(item in oldItems)) {
      added.push(item);
    } else {
      const handlers = diffHandlers(oldItems[item].handlers, newItem.handlers, item);
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
export function diffSegmentSchema(oldJson: VovkSegmentSchema, newJson: VovkSegmentSchema): DiffResult {
  return {
    controllers: diffControllers<VovkSegmentSchema['controllers']>(
      oldJson.controllers ?? {},
      newJson.controllers ?? {}
    ),
  };
}
