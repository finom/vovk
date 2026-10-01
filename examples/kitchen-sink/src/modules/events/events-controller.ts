import { procedure, get, prefix } from 'vovk';
import { z } from 'zod';

const eventNames = [
  'foo',
  'bar',
  'baz',
  'qux',
  'quux',
  'corge',
  'grault',
  'garply',
  'waldo',
  'fred',
  'plugh',
  'xyzzy',
  'thud',
] as const;

@prefix('events')
export default class EventsController {
  @get()
  static streamEvents = procedure({
    validateEachIteration: true,
    iteration: z.object({
      event: z.enum(eventNames).meta({ description: 'Event name' }),
      payload: z.object({
        timestamp: z.iso.datetime().meta({ description: 'Event timestamp' }),
        message: z.string().meta({ description: 'Event message' }),
      }),
    }),
  }).handle(async function* () {
    for (const event of eventNames) {
      yield {
        event,
        payload: {
          timestamp: new Date().toISOString(),
          message: `This is a message for event "${event}"`,
        },
      };
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  });
}
