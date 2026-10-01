import type { VovkIteration } from 'vovk';
import type StreamController from './stream-controller';

export default class StreamService {
  static async *streamTokens() {
    const tokens: VovkIteration<typeof StreamController.streamTokens>[] =
      'Vovk.ts is a RESTful back-end meta-framework with RPC, built on top of the Next.js App Router. This text is a JSONLines stream demo.'
        .match(/[^\s-]+-?(?:\s+)?/g)
        ?.map((message) => ({ message })) || [];

    for (const token of tokens) {
      yield token;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
}
