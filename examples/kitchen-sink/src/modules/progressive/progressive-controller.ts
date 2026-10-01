import { procedure, get, JSONLinesResponder, prefix, type VovkIteration } from 'vovk';
import { z } from 'zod';
import ProgressiveService from './progressive-service.ts';

@prefix('progressive')
export default class ProgressiveController {
  @get('', { cors: true })
  static streamProgressiveResponse = procedure({
    validateEachIteration: true,
    iteration: z.union([
      z.strictObject({
        users: z.array(
          z.strictObject({
            id: z.number(),
            name: z.string(),
          })
        ),
      }),
      z.strictObject({
        tasks: z.array(
          z.strictObject({
            id: z.number(),
            title: z.string(),
            completed: z.boolean(),
          })
        ),
      }),
    ]),
  }).handle(async (req) => {
    const responder = new JSONLinesResponder<VovkIteration<typeof ProgressiveController.streamProgressiveResponse>>(
      req
    );

    void ProgressiveService.streamProgressiveResponse(responder);

    return responder;
  });
}
