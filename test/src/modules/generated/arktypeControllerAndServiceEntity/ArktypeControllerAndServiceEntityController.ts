import { prefix, get, put, post, del, operation } from 'vovk';
import { type } from 'arktype';
import withArk from '../../../lib/withArk.ts';

import ArktypeControllerAndServiceEntityService from './ArktypeControllerAndServiceEntityService.ts';

@prefix('arktype-controller-and-service-entities')
export default class ArktypeControllerAndServiceEntityController {
  @operation({
    summary: 'Get arktypeControllerAndServiceEntities',
  })
  @get()
  static getArktypeControllerAndServiceEntities = withArk({
    handle() {
      return ArktypeControllerAndServiceEntityService.getArktypeControllerAndServiceEntities();
    },
  });

  @operation({
    summary: 'Get single arktypeControllerAndServiceEntity',
  })
  @get('{id}')
  static getSingleArktypeControllerAndServiceEntity = withArk({
    params: type({ id: type('string') }),
    handle(_req, { id }) {
      return ArktypeControllerAndServiceEntityService.getSingleArktypeControllerAndServiceEntity(id);
    },
  });

  @operation({
    summary: 'Update arktypeControllerAndServiceEntity',
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

  @operation({
    summary: 'Create arktypeControllerAndServiceEntity',
  })
  @post()
  static createArktypeControllerAndServiceEntity = withArk({
    body: type({ todo: type('true') }),
    async handle(req) {
      const body = await req.json();

      return ArktypeControllerAndServiceEntityService.createArktypeControllerAndServiceEntity(body);
    },
  });

  @operation({
    summary: 'Delete arktypeControllerAndServiceEntity',
  })
  @del('{id}')
  static deleteArktypeControllerAndServiceEntity = withArk({
    params: type({ id: type('string') }),
    handle(_req, params) {
      const { id } = params;

      return ArktypeControllerAndServiceEntityService.deleteArktypeControllerAndServiceEntity(id);
    },
  });
}
