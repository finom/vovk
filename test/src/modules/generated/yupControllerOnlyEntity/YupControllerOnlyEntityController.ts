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
    handle() {
      return { message: 'TODO: get yupControllerOnlyEntities' };
    },
  });

  @operation({
    summary: 'Update YupControllerOnlyEntity',
  })
  @put('{id}')
  static updateYupControllerOnlyEntity = withYup({
    body: yup.object({
      todo: yup.boolean().required(),
    }),
    params: yup.object({
      id: yup.string().required(),
    }),
    async handle(req, params: { id: string }) {
      const { id } = params;
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
    async handle(_req, params) {
      const { id } = params;

      return { message: `TODO: delete yupControllerOnlyEntity`, id };
    },
  });
}
