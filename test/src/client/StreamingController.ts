import { VovkRequest, post, prefix } from 'vovk';
import { StreamJSONResponse as StreamJSONResponse } from 'vovk/StreamJSONResponse';

export type Token = { token: string; query: 'queryValue' };

@prefix('streaming')
export default class StreamingController {
  @post.auto()
  static async postWithStreaming(req: VovkRequest<Omit<Token, 'query'>[], { query: 'queryValue' }>) {
    const body = await req.json();
    const query = req.nextUrl.searchParams.get('query');

    const response = new StreamJSONResponse<Token>();

    void (async () => {
      for (const token of body) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        response.send({ ...token, query });
      }

      response.close();
    })();

    return response;
  }

  @post.auto()
  static postWithStreamingAndImmediateError(req: VovkRequest<Omit<Token, 'query'>[], { query: 'queryValue' }>) {
    if (req) {
      throw new Error('Immediate error');
    }

    const response = new StreamJSONResponse<Token>();

    return response;
  }

  @post.auto()
  static async postWithStreamingAndDelayedError(req: VovkRequest<Omit<Token, 'query'>[], { query: 'queryValue' }>) {
    const body = await req.json();
    const query = req.nextUrl.searchParams.get('query');

    const response = new StreamJSONResponse<Token>();

    let count = 0;
    void (async () => {
      for (const token of body) {
        if (++count === 3) {
          return response.throw('velyka dupa');
        }
        await new Promise((resolve) => setTimeout(resolve, 200));
        response.send({ ...token, query });
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

    const response = new StreamJSONResponse<Token>();

    let count = 0;
    void (async () => {
      for (const token of body) {
        if (++count === 3) {
          return response.throw({ customError: 'custom error' });
        }
        await new Promise((resolve) => setTimeout(resolve, 200));
        response.send({ ...token, query });
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

    using response = new StreamJSONResponse<Token>();

    let count = 0;
    void (async () => {
      for (const token of body) {
        if (++count === 3) {
          throw new Error('Unhandled error');
        }
        await new Promise((resolve) => setTimeout(resolve, 200));
        response.send({ ...token, query });
      }
    })();

    return response;
  }
}
