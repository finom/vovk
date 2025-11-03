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
    handle() {
      return YupControllerAndServiceEntityService.getYupControllerAndServiceEntities();
    },
  });

  @operation({
    summary: 'Get single YupControllerAndServiceEntity',
  })
  @get('{id}')
  static getSingleYupControllerAndServiceEntity = withYup({
    params: yup.object({
      id: yup.string().required(),
    }),
    handle(_req, { id }) {
      return YupControllerAndServiceEntityService.getSingleYupControllerAndServiceEntity(id);
    },
  });

  @operation({
    summary: 'Update YupControllerAndServiceEntity',
  })
  @put('{id}')
  static updateYupControllerAndServiceEntity = withYup({
    body: yup.object({
      todo: yup.boolean().required(),
    }),
    params: yup.object({
      id: yup.string().required(),
    }),
    async handle(req, { id }) {
      const body = await req.json();

      return YupControllerAndServiceEntityService.updateYupControllerAndServiceEntity(id, body);
    },
  });

  @post()
  static createYupControllerAndServiceEntity = withYup({
    body: yup.object({
      todo: yup.boolean().required(),
    }),
    async handle(req) {
      const body = await req.json();

      return YupControllerAndServiceEntityService.createYupControllerAndServiceEntity(body);
    },
  });

  @del('{id}')
  static deleteYupControllerAndServiceEntity = withYup({
    params: yup.object({
      id: yup.string().required(),
    }),
    async handle(_req, { id }) {
      return YupControllerAndServiceEntityService.deleteYupControllerAndServiceEntity(id);
    },
  });
}
