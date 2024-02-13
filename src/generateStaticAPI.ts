import { _VovkController as VovkController } from './types';

// eslint-disable-next-line @typescript-eslint/ban-types
export function _generateStaticAPI(c: Record<string, Function>, slug = 'vovk') {
  const controllers = c as Record<string, VovkController>;
  return [
    { [slug]: ['__ping'] },
    ...Object.values(controllers)
      .map((controller) => {
        const handlers = controller._handlers;
        const splitPrefix = controller._prefix?.split('/') ?? [];

        return Object.values(handlers).map((handler) => {
          return { [slug]: [...splitPrefix, ...handler.path.split('/')].filter(Boolean) };
        });
      })
      .flat(),
  ];
}
