import path from 'node:path';
import { describe, it } from 'node:test';
import getCLIAssertions from '../../lib/get-cli-assertions.mts';

await describe('CLI new controller and service', async () => {
  const { runAtProjectDir, assertFile, assertNotExists, createVovkApp } = getCLIAssertions({
    cwd: path.resolve(import.meta.dirname, '../../..'),
    dir: 'tmp_test_dir_new_controller_and_service',
  });

  await it('New service only', async () => {
    await createVovkApp({
      vovkInitFlags: '--yes --validation-library=none',
    });

    await runAtProjectDir('../dist/index.mjs new segment');
    await runAtProjectDir('../dist/index.mjs new service user');

    await assertFile('src/modules/user/user-service.ts', [
      `export default class UserService {`,
      `static getUsers = `,
      `static updateUser = `,
    ]);

    await assertFile('src/app/api/[[...vovk]]/route.ts', [
      `const controllers = {};`,
      `initSegment({
        emitSchema: true,
        controllers,
      });`,
    ]);

    await assertNotExists('src/modules/user/user-controller.ts');
  });

  await it('New controller and service without validation library', async () => {
    await createVovkApp({
      vovkInitFlags: '--yes --validation-library=none',
    });
    await runAtProjectDir('../dist/index.mjs new segment');
    await runAtProjectDir('../dist/index.mjs new controller service user');

    await assertFile('src/modules/user/user-controller.ts', [
      `import UserService from './user-service';`,
      `export default class UserController {`,
      `@get()
      static getUsers = (`,
      `static createUser = `,
      `static updateUser = `,
    ]);
    await assertFile('src/modules/user/user-service.ts', [
      `export default class UserService {`,
      `static getUsers = `,
      `static updateUser = `,
    ]);
    await assertFile('src/app/api/[[...vovk]]/route.ts', [
      `import UserController from '../../../modules/user/user-controller';`,
      `const controllers = {
        UserRPC: UserController,
      };`,
      `initSegment({
        emitSchema: true,
        controllers, 
      });`,
    ]);
  });

  await it('New --empty controller and service', async () => {
    await createVovkApp({
      vovkInitFlags: '--yes --validation-library=none',
    });
    await runAtProjectDir('../dist/index.mjs new segment');
    await runAtProjectDir('../dist/index.mjs new controller service user --empty');

    await assertFile('src/modules/user/user-controller.ts', [`export default class UserController {}`]);
    await assertFile('src/modules/user/user-service.ts', [`export default class UserService {}`]);
    await assertFile('src/app/api/[[...vovk]]/route.ts', [
      `import UserController from '../../../modules/user/user-controller';`,
      `const controllers = {
        UserRPC: UserController,
      };`,
      `initSegment({
        emitSchema: true,
        controllers, 
      });`,
    ]);
  });
});
