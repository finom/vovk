import { prefix, get, put, post, del, operation } from 'vovk';
import { withZod } from 'vovk-zod';
import { z } from 'zod';

@prefix('zod-controller-only-entities')
export default class ZodControllerOnlyEntityController {
  @operation({
    summary: 'Get ZodControllerOnlyEntities',
  })
  @get()
  static getZodControllerOnlyEntities = withZod({
    handle() {
      return { message: 'TODO: get zodControllerOnlyEntities' };
    },
  });

  @operation({
    summary: 'Get single ZodControllerOnlyEntity',
  })
  @get('{id}')
  static getSingleZodControllerOnlyEntity = withZod({
    params: z.object({
      id: z.string(),
    }),
    handle(_req, { id }) {
      return { message: `TODO: get single zodControllerOnlyEntity`, id };
    },
  });

  @operation({
    summary: 'Update ZodControllerOnlyEntity',
  })
  @put('{id}')
  static updateZodControllerOnlyEntity = withZod({
    body: z.object({
      todo: z.literal(true),
    }),
    params: z.object({ id: z.string() }),
    async handle(req, { id }) {
      const body = await req.json();

      return { message: `TODO: update zodControllerOnlyEntity`, id, body };
    },
  });

  @post()
  static createZodControllerOnlyEntity = withZod({
    body: z.object({
      todo: z.literal(true),
    }),
    async handle(req) {
      const body = await req.json();

      return { message: `TODO: create zodControllerOnlyEntity`, body };
    },
  });

  @del('{id}')
  static deleteZodControllerOnlyEntity = withZod({
    params: z.object({
      id: z.string(),
    }),
    handle(req, { id }) {
      return { message: `TODO: delete zodControllerOnlyEntity`, id };
    },
  });
}
