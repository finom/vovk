import { prefix, get, put, post, del, operation } from 'vovk';
import { type } from 'arktype';
import withArk from '../../../lib/withArk.ts';

import ArktypeControllerAndServiceEntityService from './ArktypeControllerAndServiceEntityService.ts';

@prefix('arktype-controller-and-service-entities')
export default class ArktypeControllerAndServiceEntityController {
  @operation({
    summary: 'Get ArktypeControllerAndServiceEntities',
  })
  @get()
  static getArktypeControllerAndServiceEntities = withArk({
    handle() {
      return ArktypeControllerAndServiceEntityService.getArktypeControllerAndServiceEntities();
    },
  });

  @operation({
    summary: 'Get single ArktypeControllerAndServiceEntity',
  })
  @get('{id}')
  static getSingleArktypeControllerAndServiceEntity = withArk({
    params: type({ id: type('string') }),
    handle(_req, { id }) {
      return ArktypeControllerAndServiceEntityService.getSingleArktypeControllerAndServiceEntity(id);
    },
  });

  @operation({
    summary: 'Update ArktypeControllerAndServiceEntity',
  })
  @put('{id}')
  static updateArktypeControllerAndServiceEntity = withArk({
    body: type({ todo: type('true') }),
    params: type({ id: type('string') }),
    async handle(req, { id }) {
      const body = await req.json();

      return ArktypeControllerAndServiceEntityService.updateArktypeControllerAndServiceEntity(id, body);
    },
  });

  @post()
  static createArktypeControllerAndServiceEntity = withArk({
    body: type({ todo: type('true') }),
    async handle(req) {
      const body = await req.json();

      return ArktypeControllerAndServiceEntityService.createArktypeControllerAndServiceEntity(body);
    },
  });

  @del('{id}')
  static deleteArktypeControllerAndServiceEntity = withArk({
    params: type({ id: type('string') }),
    handle(_req, params) {
      const { id } = params;

      return ArktypeControllerAndServiceEntityService.deleteArktypeControllerAndServiceEntity(id);
    },
  });
}
