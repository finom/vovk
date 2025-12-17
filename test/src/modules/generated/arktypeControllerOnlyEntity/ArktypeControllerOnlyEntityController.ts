import { prefix, get, put, post, del, operation } from 'vovk';
import { type } from 'arktype';
import withArk from '../../../lib/withArk.ts';

@prefix('arktype-controller-only-entities')
export default class ArktypeControllerOnlyEntityController {
  @operation({
    summary: 'Get arktypeControllerOnlyEntities',
  })
  @get()
  static getArktypeControllerOnlyEntities = withArk({
    handle() {
      return { message: 'TODO: get arktypeControllerOnlyEntities' };
    },
  });

  @operation({
    summary: 'Get single arktypeControllerOnlyEntity',
  })
  @get('{id}')
  static getSingleArktypeControllerOnlyEntity = withArk({
    params: type({ id: type('string') }),
    handle(_req, { id }) {
      return { message: 'TODO: get single arktypeControllerOnlyEntity', id };
    },
  });

  @operation({
    summary: 'Update arktypeControllerOnlyEntity',
  })
  @put('{id}')
  static updateArktypeControllerOnlyEntity = withArk({
    body: type({ todo: type('true') }),
    params: type({ id: type('string') }),
    async handle(req, { id }) {
      const body = await req.json();

      return { message: `TODO: update arktypeControllerOnlyEntity`, id, body };
    },
  });

  @operation({
    summary: 'Create arktypeControllerOnlyEntity',
  })
  @post()
  static createArktypeControllerOnlyEntity = withArk({
    body: type({ todo: type('true') }),
    async handle(req) {
      const body = await req.json();

      return { message: `TODO: create arktypeControllerOnlyEntity`, body };
    },
  });

  @operation({
    summary: 'Delete arktypeControllerOnlyEntity',
  })
  @del('{id}')
  static deleteArktypeControllerOnlyEntity = withArk({
    params: type({ id: type('string') }),
    handle(_req, params) {
      const { id } = params;

      return { message: `TODO: delete arktypeControllerOnlyEntity`, id };
    },
  });
}
