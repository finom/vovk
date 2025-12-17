import { endpoint, prefix, get, put, post, del, operation } from 'vovk';
import { z } from 'zod';

@prefix('zod-controller-only-entities')
export default class ZodControllerOnlyEntityController {
  @operation({
    summary: 'Get zodControllerOnlyEntities',
  })
  @get()
  static getZodControllerOnlyEntities = endpoint({
    handle() {
      return { message: 'TODO: get zodControllerOnlyEntities' };
    },
  });

  @operation({
    summary: 'Get single zodControllerOnlyEntity',
  })
  @get('{id}')
  static getSingleZodControllerOnlyEntity = endpoint({
    params: z.object({
      id: z.string(),
    }),
    handle(_req, { id }) {
      return { message: `TODO: get single zodControllerOnlyEntity`, id };
    },
  });

  @operation({
    summary: 'Update zodControllerOnlyEntity',
  })
  @put('{id}')
  static updateZodControllerOnlyEntity = endpoint({
    body: z.object({
      todo: z.literal(true),
    }),
    params: z.object({ id: z.string() }),
    async handle(req, { id }) {
      const body = await req.json();

      return { message: `TODO: update zodControllerOnlyEntity`, id, body };
    },
  });

  @operation({
    summary: 'Create zodControllerOnlyEntity',
  })
  @post()
  static createZodControllerOnlyEntity = endpoint({
    body: z.object({
      todo: z.literal(true),
    }),
    async handle(req) {
      const body = await req.json();

      return { message: `TODO: create zodControllerOnlyEntity`, body };
    },
  });

  @operation({
    summary: 'Delete zodControllerOnlyEntity',
  })
  @del('{id}')
  static deleteZodControllerOnlyEntity = endpoint({
    params: z.object({
      id: z.string(),
    }),
    handle(req, { id }) {
      return { message: `TODO: delete zodControllerOnlyEntity`, id };
    },
  });
}
