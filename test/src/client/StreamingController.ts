import { type VovkRequest, post, prefix } from 'vovk';
import { JSONLinesResponder } from 'vovk';

export type Token = { token: string; query: 'queryValue' };

@prefix('streaming')
export default class StreamingController {
  @post.auto()
  static async postWithStreaming(req: VovkRequest<Omit<Token, 'query'>[], { query: 'queryValue' }>) {
    const body = await req.json();
    const query = req.nextUrl.searchParams.get('query');

    const response = new JSONLinesResponder<Token>(req);

    void (async () => {
      for (const token of body) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        await response.send({ ...token, query });
      }

      response.close();
    })();

    return response;
  }

  @post.auto()
  static async postWithStreamingAndImmediateError(req: VovkRequest<Omit<Token, 'query'>[], { query: 'queryValue' }>) {
    if (req) {
      throw new Error('Immediate error');
    }

    const response = new JSONLinesResponder<Token>(req);

    return response;
  }

  @post.auto()
  static async postWithStreamingAndDelayedError(req: VovkRequest<Omit<Token, 'query'>[], { query: 'queryValue' }>) {
    const body = await req.json();
    const query = req.nextUrl.searchParams.get('query');

    const response = new JSONLinesResponder<Token>(req);

    let count = 0;
    void (async () => {
      for (const token of body) {
        if (++count === 3) {
          return response.throw('oh no');
        }
        await new Promise((resolve) => setTimeout(resolve, 200));
        await response.send({ ...token, query });
      }
    })();

    return response;
  }

  @post.auto()
  static async postWithStreamingAndDelayedCustomError(
    req: VovkRequest<Omit<Token, 'query'>[], { query: 'queryValue' }>
  ) {
    const body = await req.json();
    const query = req.nextUrl.searchParams.get('query');

    const response = new JSONLinesResponder<Token>(req);

    let count = 0;
    void (async () => {
      for (const token of body) {
        if (++count === 3) {
          return response.throw({ customError: 'custom error' });
        }
        await new Promise((resolve) => setTimeout(resolve, 200));
        await response.send({ ...token, query });
      }
    })();

    return response;
  }

  @post.auto()
  static async postWithStreamingAndDelayedUnhandledError(
    req: VovkRequest<Omit<Token, 'query'>[], { query: 'queryValue' }>
  ) {
    const body = await req.json();
    const query = req.nextUrl.searchParams.get('query');

    const response = new JSONLinesResponder<Token>(req);

    let count = 0;
    void (async () => {
      for (const token of body) {
        if (++count === 3) {
          throw new Error('Unhandled error');
        }
        await new Promise((resolve) => setTimeout(resolve, 200));
        await response.send({ ...token, query });
      }
    })();

    return response;
  }

  @post.auto()
  static async progressiveResponse(req: VovkRequest<{ hello: 'world' }>) {
    const { hello } = await req.json();
    const getFoo = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { foo: 'foo1' } as const;
    };

    const getBar = async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return { bar: 'bar2' } as const;
    };

    const response = new JSONLinesResponder<{ foo: 'foo1' } | { bar: 'bar2' } | { hello: 'world' }>(req);

    Promise.all([
      Promise.resolve(response.send({ hello })),
      getFoo().then(({ foo }) => response.send({ foo })),
      getBar().then(({ bar }) => response.send({ bar })),
    ])
      .then(response.close)
      .catch(response.throw);

    return response;
  }
}
