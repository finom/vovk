import { z } from 'zod';
import { procedure, prefix, get, operation } from 'vovk';

@prefix('static-params')
export default class StaticParamsController {
  @operation({
    summary: 'Static Params',
    description: 'Get the static params: section and page',
  })
  @get('{section}/page{page}.json', {
    staticParams: [
      { section: 'a', page: '1' },
      { section: 'a', page: '2' },
      { section: 'a', page: '3' },
      { section: 'b', page: '1' },
      { section: 'b', page: '2' },
      { section: 'b', page: '3' },
    ],
  })
  static getStaticParams = procedure({
    params: z.object({
      section: z.enum(['a', 'b']),
      page: z.enum(['1', '2', '3']),
    }),
  }).handle(async (_req, { section, page }) => {
    return { section, page };
  });
}
