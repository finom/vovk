import { SmoothieRequest, StreamResponse, post, prefix } from '../../../src';

type Token = { token: string; query: 'queryValue' };

@prefix('streaming')
export default class StreamingController {
  static controllerName = 'StreamingController';

  @post.auto()
  static async postWithStreaming(req: SmoothieRequest<Omit<Token, 'query'>[], { query: 'queryValue' }>) {
    const body = await req.json();
    const query = req.nextUrl.searchParams.get('query');

    const response = new StreamResponse<Token>({
      headers: {
        'Content-Type': 'text/event-stream',
        Connection: 'keep-alive',
        'Content-Encoding': 'none',
        'Cache-Control': 'no-cache, no-transform',
      },
    });

    void (async () => {
      for (const token of body) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        await response.send({ ...token, query });
      }

      await response.end();
    })();

    return response;
  }
}
