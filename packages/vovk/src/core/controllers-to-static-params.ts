import type { VovkController } from '../types/core.js';
import type { StaticClass } from '../types/utils.js';
import { getServedHandlers } from './get-served-handlers.js';

/**
 * Static params for the controllers of a static segment. @see https://vovk.dev/segment
 * @example
 * ```ts
 * export function generateStaticParams() {
 *  return controllersToStaticParams(controllers);
 * }
 * ```
 */
export function controllersToStaticParams(c: Record<string, StaticClass>, slug = 'vovk'): Record<string, string[]>[] {
  const controllers = Object.values(c) as VovkController[];
  const controllerSet = new Set(controllers);
  return [
    { [slug]: ['_schema_'] },
    ...controllers.flatMap((controller) => {
      const { handlers, handlersMetadata } = getServedHandlers(controller, controllerSet);

      return Object.entries(handlers).flatMap(([name, handler]) => {
        const staticParams = handlersMetadata[name]?.staticParams;
        const segments = [...(controller._prefix?.split('/') ?? []), ...handler.path.split('/')].filter(Boolean);

        if (staticParams?.length) {
          // the prefix holds params too, and a value stays one segment even with a slash in it
          return staticParams.map((paramsItem) => ({
            [slug]: segments.map((segment) =>
              segment.replace(/\{([^{}]+)\}/g, (placeholder, paramName: string) =>
                paramsItem && Object.hasOwn(paramsItem, paramName) ? paramsItem[paramName] : placeholder
              )
            ),
          }));
        }

        return [{ [slug]: segments }];
      });
    }),
  ];
}
