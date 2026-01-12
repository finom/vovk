import type { VovkController, VovkHandlerSchema } from '../types.js';

export async function setHandlerSchema(
  h: ((...args: unknown[]) => unknown) & {
    _getSchema?: (controller: VovkController) => Omit<VovkHandlerSchema, 'httpMethod' | 'path'>;
  },
  schema: Omit<VovkHandlerSchema, 'httpMethod' | 'path'>
) {
  h._getSchema = (controller) => {
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

    return schema;
  };
}
