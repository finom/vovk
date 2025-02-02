import { prefix, get, put, post, del } from 'vovk';
import { withYup } from 'vovk-yup';
import * as yup from 'yup';

@prefix('yup-controller-only-entities')
export default class YupControllerOnlyEntityController {
  @get()
  static getYupControllerOnlyEntities = withYup(null, yup.object({ search: yup.string() }), (req) => {
    const search = req.nextUrl.searchParams.get('search');

    return { results: [], search };
  });

  @put(':id')
  static updateYupControllerOnlyEntity = withYup(
    yup.object({
      foo: yup.mixed().oneOf(['bar', 'baz']).required(),
    }),
    yup.object({ q: yup.string() }),
    async (req, params: { id: string }) => {
      const { id } = params;
      const body = await req.json();
      const q = req.nextUrl.searchParams.get('q');

      return { id, body, q };
    }
  );

  @post()
  static createYupControllerOnlyEntity = () => {
    // ...
  };

  @del(':id')
  static deleteYupControllerOnlyEntity = () => {
    // ...
  };
}
