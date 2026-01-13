import type { VovkController } from '../types/core.js';
import type { StaticClass } from '../types/utils.js';

/**
 * Generates static API of the given controllers for a static segment.
 * @see https://vovk.dev/segment
 * @example
 * ```ts
 * export function generateStaticParams() {
 *  return controllersToStaticParams(controllers);
 * }
 */
export function controllersToStaticParams(c: Record<string, StaticClass>, slug = 'vovk') {
  const controllers = c as Record<string, VovkController>;
  return [
    { [slug]: ['_schema_'] },
    ...Object.values(controllers)
      .map((controller) => {
        const handlers = controller._handlers;
        const splitPrefix = controller._prefix?.split('/') ?? [];

        return Object.entries(handlers ?? {})
          .map(([name, handler]) => {
            const staticParams = controller._handlersMetadata?.[name]?.staticParams;

            if (staticParams?.length) {
              return staticParams.map((paramsItem) => {
                let path = handler.path;
                for (const [key, value] of Object.entries(paramsItem ?? {})) {
                  path = path.replace(`{${key}}`, value);
                }
                return { [slug]: [...splitPrefix, ...path.split('/')].filter(Boolean) };
              });
            }

            return [{ [slug]: [...splitPrefix, ...handler.path.split('/')].filter(Boolean) }];
          })
          .flat();
      })
      .flat(),
  ];
}
