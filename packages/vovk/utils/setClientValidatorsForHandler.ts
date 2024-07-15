import { _KnownAny as KnownAny, _VovkController as VovkController } from '../types';

export default function setClientValidatorsForHandler(
  h: (...args: KnownAny[]) => KnownAny,
  validators: {
    body: unknown;
    query: unknown;
  }
) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      const controller = (h as unknown as { _controller: VovkController })._controller;

      if (!controller) {
        throw new Error('setClientValidatorsForHandler: Controller not found');
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
        throw new Error('setClientValidatorsForHandler: Handler not found');
      }

      controller._handlers = {
        ...controller._handlers,
        [handlerName]: {
          ...controller._handlers[handlerName],
          clientValidators: {
            body: validators.body,
            query: validators.query,
          },
        },
      };

      resolve();
    }, 0);
  });
}
