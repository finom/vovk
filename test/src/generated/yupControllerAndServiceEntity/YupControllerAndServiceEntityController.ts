import { prefix, get, put, post, del } from 'vovk';
import { withYup } from 'vovk-yup';
import * as yup from 'yup';

import YupControllerAndServiceEntityService from './YupControllerAndServiceEntityService';

@prefix('yup-controller-and-service-entity')
export default class YupControllerAndServiceEntityController {
  @get()
  static getYupControllerAndServiceEntities = withYup(null, yup.object({ search: yup.string() }), (req) => {
    const search = req.nextUrl.searchParams.get('search');

    return YupControllerAndServiceEntityService.getYupControllerAndServiceEntities(search);
  });

  @put(':id')
  static updateYupControllerAndServiceEntity = withYup(
    yup.object({
      foo: yup.mixed().oneOf(['bar', 'baz']).required(),
    }),
    yup.object({ q: yup.string() }),
    async (req, params: { id: string }) => {
      const { id } = params;
      const body = await req.json();
      const q = req.nextUrl.searchParams.get('q');

      return YupControllerAndServiceEntityService.updateYupControllerAndServiceEntity(id, q, body);
    }
  );

  @post()
  static createYupControllerAndServiceEntity = () => {
    // ...
  };

  @del(':id')
  static deleteYupControllerAndServiceEntity = () => {
    // ...
  };
}
