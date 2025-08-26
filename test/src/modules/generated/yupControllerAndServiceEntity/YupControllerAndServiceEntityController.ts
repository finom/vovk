import { prefix, get, put, post, del, operation } from 'vovk';
import { withYup } from 'vovk-yup';
import * as yup from 'yup';

import YupControllerAndServiceEntityService from './YupControllerAndServiceEntityService.ts';

@prefix('yup-controller-and-service-entities')
export default class YupControllerAndServiceEntityController {
  @operation({
    summary: 'Get YupControllerAndServiceEntities',
  })
  @get()
  static getYupControllerAndServiceEntities = withYup({
    query: yup.object({ search: yup.string() }),
    handle(req) {
      const search = req.nextUrl.searchParams.get('search');

      return YupControllerAndServiceEntityService.getYupControllerAndServiceEntities(search);
    },
  });

  @operation({
    summary: 'Update YupControllerAndServiceEntity',
  })
  @put('{id}')
  static updateYupControllerAndServiceEntity = withYup({
    body: yup.object({
      foo: yup.mixed().oneOf(['bar', 'baz']).required(),
    }),
    query: yup.object({ q: yup.string() }),
    async handle(req, params: { id: string }) {
      const { id } = params;
      const body = await req.json();
      const q = req.nextUrl.searchParams.get('q');

      return YupControllerAndServiceEntityService.updateYupControllerAndServiceEntity(id, q, body);
    },
  });

  @post()
  static createYupControllerAndServiceEntity = () => {
    // ...
  };

  @del(':id')
  static deleteYupControllerAndServiceEntity = () => {
    // ...
  };
}
