import type { KnownAny, VovkController, VovkHandlerSchema } from '../types';

export function setHandlerValidation(
  h: (...args: KnownAny[]) => KnownAny,
  validation: Pick<Exclude<VovkHandlerSchema['validation'], undefined>, 'body' | 'query' | 'output'>
) {
  return new Promise<void>((resolve) => {
    // the setTimeout is necessary to ensure that the _controller is already defined
    setTimeout(() => {
      const controller = (h as unknown as { _controller: VovkController })._controller;

      if (!controller) {
        throw new Error(
          'Error setting client validators. Controller not found. Did you forget to use an HTTP decorator?'
        );
      }

      const handlerName = Object.getOwnPropertyNames(controller).find(
        (key) =>
          (
            controller[key] as {
              _sourceMethod?: unknown;
            }
          )._sourceMethod === h
      );

      if (!handlerName) {
        throw new Error('Error setting client validators. Handler not found.');
      }

      controller._handlers = {
        ...controller._handlers,
        [handlerName]: {
          ...controller._handlers[handlerName],
          validation,
        },
      };

      resolve();
    }, 0);
  });
}
