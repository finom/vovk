import { prefix, get, put, post, del, operation } from 'vovk';
import { withYup } from 'vovk-yup';
import * as yup from 'yup';

@prefix('yup-controller-only-entities')
export default class YupControllerOnlyEntityController {
  @operation({
    summary: 'Get YupControllerOnlyEntities',
  })
  @get()
  static getYupControllerOnlyEntities = withYup({
    query: yup.object({ search: yup.string() }),
    handle(req) {
      const search = req.nextUrl.searchParams.get('search');

      return { results: [], search };
    },
  });

  @operation({
    summary: 'Update YupControllerOnlyEntity',
  })
  @put('{id}')
  static updateYupControllerOnlyEntity = withYup({
    body: yup.object({
      foo: yup.mixed().oneOf(['bar', 'baz']).required(),
    }),
    query: yup.object({ q: yup.string() }),
    async handle(req, params: { id: string }) {
      const { id } = params;
      const body = await req.json();
      const q = req.nextUrl.searchParams.get('q');

      return { id, body, q };
    },
  });

  @post()
  static createYupControllerOnlyEntity = () => {
    // ...
  };

  @del(':id')
  static deleteYupControllerOnlyEntity = () => {
    // ...
  };
}
