import type { JSONLinesResponder, VovkIteration } from 'vovk';
import type JSONLinesResponderController from './json-lines-responder-controller.ts';

type Token = VovkIteration<typeof JSONLinesResponderController.streamTokens>;

export default class JSONLinesResponderService {
  static async streamTokens(responder: JSONLinesResponder<Token>) {
    const tokens: Token[] = [
      { message: 'Hello,' },
      { message: ' World' },
      { message: ' from' },
      { message: ' JSONLines' },
      { message: ' Endpoint' },
      { message: ' that' },
      { message: ' uses' },
      { message: ' JSONLines' },
      { message: 'Responder' },
      { message: ' instance' },
      { message: '!' },
    ];

    for (const token of tokens) {
      await responder.send(token);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    responder.close();
  }
}
