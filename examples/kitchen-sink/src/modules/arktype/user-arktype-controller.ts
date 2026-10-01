import { type } from 'arktype';
import { procedure, prefix, post, operation } from 'vovk';

@prefix('users-arktype')
export default class UserArktypeController {
  @operation({
    summary: 'Update user (Arktype)',
    description: 'Update user by ID with Arktype validation',
  })
  @post('{id}')
  static updateUser = procedure({
    body: type({
      name: type('string').describe('User full name'),
      age: type('0 < number < 120').describe('User age'),
      email: type('string.email').describe('User email'),
    }).describe('User object'),
    params: type({
      id: type('string.uuid').describe('User ID'),
    }),
    query: type({
      notify: type('"email" | "push" | "none"').describe('Notification type'),
    }),
    output: type({
      success: type('boolean').describe('Success status'),
    }),
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
