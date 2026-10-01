import { get, operation, prefix, procedure } from 'vovk';
import { z } from 'zod';
import StreamService from './stream-service';

@prefix('streams')
export default class StreamController {
  @operation({
    summary: 'Stream tokens',
    description: 'Stream tokens to the client',
  })
  @get('tokens')
  static streamTokens = procedure({
    validateEachIteration: true,
    iteration: z
      .object({
        message: z.string().meta({ description: 'Message from the token' }),
      })
      .meta({
        description: 'Streamed token object',
      }),
  }).handle(async function* () {
    yield* StreamService.streamTokens();
  });
}
