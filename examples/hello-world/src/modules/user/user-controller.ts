import { operation, post, prefix, procedure } from 'vovk';
import { z } from 'zod';
import UserService from './user-service';

@prefix('users')
export default class UserController {
  @operation({
    summary: 'Update user',
    description: 'Update user by ID',
  })
  @post('{id}')
  static updateUser = procedure({
    body: z
      .object({
        email: z.email().meta({
          description: 'User email',
          examples: ['john@example.com', 'jane@example.com'],
        }),
        profile: z
          .object({
            name: z
              .string()
              .min(2)
              .meta({
                description: 'User full name',
                examples: ['John Doe', 'Jane Smith'],
              }),
            age: z
              .int()
              .min(16)
              .max(120)
              .meta({ description: 'User age', examples: [25, 30] }),
          })
          .meta({ description: 'User profile object' }),
      })
      .meta({ description: 'User data object' }),
    params: z
      .object({
        id: z.uuid().meta({
          description: 'User ID',
          examples: ['123e4567-e89b-12d3-a456-426614174000'],
        }),
      })
      .meta({
        description: 'Path parameters',
      }),
    query: z
      .object({
        notify: z
          .enum(['email', 'push', 'none'])
          .meta({ description: 'Notification type' }),
      })
      .meta({
        description: 'Query parameters',
      }),
    output: z
      .object({
        success: z.boolean().meta({ description: 'Success status' }),
        id: z.uuid().meta({ description: 'User ID' }),
        notify: z.enum(['email', 'push', 'none']).meta({
          description: 'Notification type',
        }),
      })
      .meta({ description: 'Response object' }),
  }).handle(async (req, { id }) => {
    const body = await req.json();
    const notify = req.nextUrl.searchParams.get('notify');

    return UserService.updateUser(id, body, notify);
  });
}
