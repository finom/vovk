import { procedure, get, prefix } from 'vovk';
import { z } from 'zod';

@prefix('polling')
export default class PollController {
  @get('', { cors: true })
  static streamPollResponse = procedure({
    query: z.object({
      i: z.string().regex(/^\d{1,6}$/),
    }),
    iteration: z.object({
      i: z.number(),
    }),
  }).handle(async function* (req) {
    let i = Number(req.vovk.query().i);
    while (true) {
      yield { i: ++i };
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (!(i % 10)) {
        break;
      }
    }
  });
}
