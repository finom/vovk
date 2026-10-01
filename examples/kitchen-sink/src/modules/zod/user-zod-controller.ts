import { z } from 'zod';
import { procedure, prefix, post, operation } from 'vovk';

@prefix('users-zod')
export default class UserZodController {
  @operation({
    summary: 'Update user (Zod)',
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
      })
      .meta({ description: 'Response object' }),
  }).handle(async (req, { id }) => {
    const { name, age, email } = await req.json();
    const notify = req.nextUrl.searchParams.get('notify');

    // do something with the data
    console.log(`Updating user ${id}:`, { name, age, email, notify });
    return {
      success: true,
    };
  });
}
