import { prefix, get, operation, JSONLinesResponder, procedure, type VovkIteration } from 'vovk';
import JSONLinesResponderService from './json-lines-responder-service.ts';
import z from 'zod';

@prefix('jsonlines-responder')
export default class JSONLinesResponderController {
  @operation({
    summary: 'Stream tokens using Response object',
    description: 'Stream tokens to the client using Response object',
  })
  @get('tokens', { cors: true })
  static streamTokens = procedure({
    iteration: z.object({ message: z.string() }),
  }).handle(async (req) => {
    const responder = new JSONLinesResponder<VovkIteration<typeof JSONLinesResponderController.streamTokens>>(req);

    void JSONLinesResponderService.streamTokens(responder);

    return responder;
  });
}
