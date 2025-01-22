import { VovkController as VovkController, StaticClass as StaticClass } from '../types';

export function generateStaticAPI(c: Record<string, StaticClass>, slug = 'vovk') {
  const controllers = c as Record<string, VovkController>;
  return [
    { [slug]: ['_schema_'] },
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
