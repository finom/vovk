import { get, prefix, operation, procedure, type VovkIteration } from 'vovk';
import z from 'zod';

@prefix('jsonlines')
export default class JSONLinesController {
  @operation({
    summary: 'Stream tokens',
    description: 'Stream tokens to the client',
  })
  @get('tokens', { cors: true })
  static streamTokens = procedure({
    iteration: z.object({ message: z.string() }),
  }).handle(async function* () {
    const tokens: VovkIteration<typeof JSONLinesController.streamTokens>[] = [
      { message: 'Hello,' },
      { message: ' World' },
      { message: ' from' },
      { message: ' JSONLines' },
      { message: ' Endpoint' },
      { message: '!' },
    ];

    for (const token of tokens) {
      yield token;
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  });
}
