import { post, put, get, del, prefix } from 'vovk';
import withYup from 'vovk-yup';
import * as Yup from 'yup';

@prefix('with-yup')
export default class WithYupClientController {
  @post.auto()
  static postWithBodyAndQuery = withYup(
    Yup.object({ hello: Yup.string().oneOf(['body']).required() }),
    Yup.object({ hey: Yup.string().oneOf(['query']).required() }),
    async (req) => {
      const body = await req.json();
      const hey = req.nextUrl.searchParams.get('hey');
      return { body, query: { hey } };
    }
  );

  @put.auto()
  static putWithBodyAndNullQuery = withYup(
    Yup.object({ hello: Yup.string().oneOf(['body']).required() }),
    null,
    async (req) => {
      const body = await req.json();
      return { body };
    }
  );

  @del.auto()
  static putWithBodyOnly = withYup(Yup.object({ hello: Yup.string().oneOf(['body']).required() }), async (req) => {
    const body = await req.json();
    return { body };
  });

  @get.auto()
  static getWithQueryAndNullBody = withYup(
    null,
    Yup.object({ hey: Yup.string().oneOf(['query']).required() }),
    (req) => {
      const hey = req.nextUrl.searchParams.get('hey');
      return { query: { hey } };
    }
  );
}
