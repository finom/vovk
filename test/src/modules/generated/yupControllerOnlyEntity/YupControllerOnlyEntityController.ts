import { prefix, get, put, post, del, operation } from 'vovk';
import { withYup } from 'vovk-yup';
import * as yup from 'yup';

@prefix('yup-controller-only-entities')
export default class YupControllerOnlyEntityController {
  @operation({
    summary: 'Get yupControllerOnlyEntities',
  })
  @get()
  static getYupControllerOnlyEntities = withYup({
    handle() {
      return { message: 'TODO: get yupControllerOnlyEntities' };
    },
  });

  @operation({
    summary: 'Get single yupControllerOnlyEntity',
  })
  @get('{id}')
  static getSingleYupControllerOnlyEntity = withYup({
    params: yup.object({
      id: yup.string().required(),
    }),
    handle(_req, { id }) {
      return { message: `TODO: get single yupControllerOnlyEntity`, id };
    },
  });

  @operation({
    summary: 'Update yupControllerOnlyEntity',
  })
  @put('{id}')
  static updateYupControllerOnlyEntity = withYup({
    body: yup.object({
      todo: yup.boolean().required(),
    }),
    params: yup.object({
      id: yup.string().required(),
    }),
    async handle(req, { id }) {
      const body = await req.json();

      return { message: `TODO: update yupControllerOnlyEntity`, id, body };
    },
  });

  @post()
  static createYupControllerOnlyEntity = withYup({
    body: yup.object({
      todo: yup.boolean().required(),
    }),
    async handle(req) {
      const body = await req.json();

      return { message: `TODO: create yupControllerOnlyEntity`, body };
    },
  });

  @del('{id}')
  static deleteYupControllerOnlyEntity = withYup({
    params: yup.object({
      id: yup.string().required(),
    }),
    async handle(_req, { id }) {
      return { message: `TODO: delete yupControllerOnlyEntity`, id };
    },
  });
}
