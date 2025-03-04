import { it, describe } from 'node:test';
import path from 'node:path';
import getCLIAssertions from '../../lib/getCLIAssertions.mts';

await describe('CLI new controller and service', async () => {
  const { runAtProjectDir, createNextApp, vovkInit, assertFile, assertNotExists } = getCLIAssertions({
    cwd: path.resolve(import.meta.dirname, '../../..'),
    dir: 'tmp_test_dir',
  });

  await it('New service only', async () => {
    await createNextApp();
    await vovkInit('--yes --validation-library=none');
    await runAtProjectDir('../dist/index.mjs new segment');
    await runAtProjectDir('../dist/index.mjs new service user');

    await assertFile('src/modules/user/UserService.ts', [
      `export default class UserService {`,
      `static getUsers = `,
      `static updateUser = `,
    ]);

    await assertFile('src/app/api/[[...vovk]]/route.ts', [
      `const controllers = {};`,
      `initVovk({
        emitSchema: true,
        controllers,
      });`,
    ]);

    await assertNotExists('src/modules/user/UserController.ts');
  });

  await it('New controller and service without validation library', async () => {
    await createNextApp();
    await vovkInit('--yes --validation-library=none');
    await runAtProjectDir('../dist/index.mjs new segment');
    await runAtProjectDir('../dist/index.mjs new controller service user');

    await assertFile('src/modules/user/UserController.ts', [
      `import UserService from './UserService';`,
      `export default class UserController {
        @get()
        static getUsers = async (`,
      `static createUser = `,
      `static updateUser = `,
    ]);
    await assertFile('src/modules/user/UserService.ts', [
      `export default class UserService {`,
      `static getUsers = `,
      `static updateUser = `,
    ]);
    await assertFile('src/app/api/[[...vovk]]/route.ts', [
      `import UserController from '../../../modules/user/UserController';`,
      `const controllers = {
        UserRPC: UserController,
      };`,
      `initVovk({
        emitSchema: true,
        controllers, 
      });`,
    ]);
  });
});
