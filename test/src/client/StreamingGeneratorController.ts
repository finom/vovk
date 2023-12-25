import { VovkRequest, post, prefix } from '../../../src';

type Token = { token: string; query: 'queryValue' };

@prefix('streaming-generator')
export default class StreamingGeneratorController {
  static controllerName = 'StreamingGeneratorController';

  @post.auto()
  static async *postWithAsyncStreaming(req: VovkRequest<Omit<Token, 'query'>[], { query: 'queryValue' }>) {
    const body = await req.json();
    const query = req.nextUrl.searchParams.get('query');

    for (const token of body) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      yield { ...token, query };
    }
  }

  @post.auto()
  static async *postWithStreaming(req: VovkRequest<Omit<Token, 'query'>[], { query: 'queryValue' }>) {
    const body = await req.json();
    const query = req.nextUrl.searchParams.get('query');

    for (const token of body) {
      yield { ...token, query };
    }
  }

  @post.auto()
  static async *postWithStreamingAndImmediateError(req: VovkRequest<Omit<Token, 'query'>[], { query: 'queryValue' }>) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    if (req) {
      throw new Error('Immediate error');
    }

    yield {} as Token;
  }

  @post.auto()
  static async *postWithStreamingAndDelayedError(req: VovkRequest<Omit<Token, 'query'>[], { query: 'queryValue' }>) {
    const body = await req.json();
    const query = req.nextUrl.searchParams.get('query');

    let count = 0;
    for (const token of body) {
      if (++count === 3) {
        throw new Error('velyka dupa');
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
      yield { ...token, query };
    }
  }

  @post.auto()
  static async *postWithStreamingAndDelayedCustomError(
    req: VovkRequest<Omit<Token, 'query'>[], { query: 'queryValue' }>
  ) {
    const body = await req.json();
    const query = req.nextUrl.searchParams.get('query');

    let count = 0;
    for (const token of body) {
      if (++count === 3) {
        throw { customError: 'custom error' };
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
      yield { ...token, query };
    }
  }

  @post.auto()
  static async *postWithStreamingAndDelayedUnhandledError(
    req: VovkRequest<Omit<Token, 'query'>[], { query: 'queryValue' }>
  ) {
    const body = await req.json();
    const query = req.nextUrl.searchParams.get('query');

    let count = 0;
    for (const token of body) {
      if (++count === 3) {
        throw new Error('Unhandled error');
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
      yield { ...token, query };
    }
  }
}
