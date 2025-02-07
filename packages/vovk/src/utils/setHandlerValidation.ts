import type { KnownAny, VovkController, VovkHandlerSchema } from '../types';

export async function setHandlerValidation(
  h: ((...args: KnownAny[]) => KnownAny) & { _onSettled?: (controller: VovkController) => void },
  validation: Pick<Exclude<VovkHandlerSchema['validation'], undefined>, 'body' | 'query' | 'output'>
) {
  h._onSettled = (controller) => {
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
        ...controller._handlers?.[handlerName],
        validation,
      },
    };
  };
}
