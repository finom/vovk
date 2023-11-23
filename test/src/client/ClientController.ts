import { headers } from 'next/headers';
import { SmoothieRequest, get, post, prefix } from '../../../src';
import validateEquality from './validateEquality';

@prefix('client')
export default class ClientController {
  static controllerName = 'ClientController';

  @get.auto()
  static getHelloWorld() {
    const world = headers().get('x-test');
    return { hello: world };
  }

  @get('with-params/:hello')
  static getWithParams(_req: SmoothieRequest<undefined>, { hello }: { hello: 'world' }) {
    return { hello };
  }

  @post('with-params/:hello')
  static async postWithParams(
    req: SmoothieRequest<{ isBody: true }, { query: 'queryValue' }>,
    params: { hello: 'world' }
  ) {
    const body = await req.json();
    console.log('body', body);
    const query = req.nextUrl.searchParams.get('query');
    return { params, body, query: { query } };
  }

  @post.auto()
  @validateEquality({ hello: 'body' }, { hey: 'query' })
  static async postWithEqualityValidation(req: SmoothieRequest<{ hello: string }, { hey: string }>) {
    const body = await req.json();
    const hey = req.nextUrl.searchParams.get('hey');
    return { body, query: { hey } };
  }
}
