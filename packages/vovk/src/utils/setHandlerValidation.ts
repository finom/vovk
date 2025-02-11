import type { KnownAny, VovkController, VovkHandlerSchema } from '../types';

export async function setHandlerValidation(
  h: ((...args: KnownAny[]) => KnownAny) & { _getValidation?: (controller: VovkController) => void },
  validation: Exclude<VovkHandlerSchema['validation'], undefined>
) {
  h._getValidation = (controller) => {
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

    return validation;
  };
}
