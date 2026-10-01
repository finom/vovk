import { z } from 'zod';
import { procedure, prefix, post, operation } from 'vovk';
import UserZodService from './user-zod-service.ts';

@prefix('users-zod-with-service')
export default class UserZodWithServiceController {
  @operation({
    summary: 'Update user (Zod with service)',
    description: 'Update user by ID with Zod validation',
  })
  @post('{id}')
  static updateUser = procedure({
    body: z
      .object({
        name: z.string().meta({ description: 'User full name', example: 'John Doe' }),
        age: z.number().min(0).max(120).meta({ description: 'User age', example: 30 }),
        email: z.email().meta({ description: 'User email', example: 'john.doe@example.com' }),
      })
      .meta({ description: 'User object' }),
    params: z.object({
      id: z.uuid().meta({ description: 'User ID' }),
    }),
    query: z.object({
      notify: z.enum(['email', 'push', 'none']).meta({ description: 'Notification type' }),
    }),
    output: z
      .object({
        success: z.boolean().meta({ description: 'Success status' }),
        id: z.uuid().meta({ description: 'User ID' }),
      })
      .meta({ description: 'Response object' }),
  }).handle(async (req) => {
    const body = await req.vovk.body();
    const query = req.vovk.query();
    const params = req.vovk.params();

    return UserZodService.updateUser(body, query, params);
  });
}
