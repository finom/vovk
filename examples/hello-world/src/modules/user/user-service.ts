import type { VovkBody, VovkOutput, VovkParams, VovkQuery } from 'vovk';
import type UserController from './user-controller';

export default class UserService {
  static updateUser = (
    id: VovkParams<typeof UserController.updateUser>['id'],
    body: VovkBody<typeof UserController.updateUser>,
    notify: VovkQuery<typeof UserController.updateUser>['notify'],
  ) => {
    console.log(
      id satisfies string,
      body satisfies { email: string; profile: { name: string; age: number } },
      notify satisfies 'email' | 'push' | 'none',
    );
    return {
      id,
      notify,
      success: true,
    } satisfies VovkOutput<typeof UserController.updateUser>;
  };
}
