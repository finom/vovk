import { it, describe } from 'node:test';
import path from 'node:path';
import getCLIAssertions from '../../lib/getCLIAssertions.mts';
import updateConfigProperty from '../../lib/updateConfigProperty.mts';

await describe('Custom components', async () => {
  const cwd = path.resolve(import.meta.dirname, '../../..');
  const dir = 'tmp_test_dir';
  const { runAtProjectDir, createNextApp, vovkInit, assertFile, assertNotExists } = getCLIAssertions({
    cwd,
    dir,
  });

  await it('New controller and state', async () => {
    await createNextApp();
    await vovkInit('--yes --validation-library=none');
    await runAtProjectDir('../dist/index.mjs new segment');
    await assertFile('src/app/api/[[...vovk]]/route.ts', [
      `const controllers = {};`,
      `initVovk({
        emitSchema: true,
        controllers, 
      });`,
    ]);
    await updateConfigProperty(
      path.join(cwd, dir, 'vovk.config.js'),
      ['templates', 'state'],
      '../test/new/custom-state.ts.ejs'
    );
    await runAtProjectDir('../dist/index.mjs new c state user');

    await assertFile('src/modules/user/UserController.ts', [
      `export default class UserController {
          @get()
          static getUsers = async (`,
      `static createUser = `,
      `static updateUser = `,
    ]);
    await assertFile('src/modules/user/UserState.ts', [`// this is the custom "User" state`]);
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

    await runAtProjectDir('../dist/index.mjs new state post');
    await assertNotExists('src/modules/post/PostController.ts');
    await assertFile('src/app/api/[[...vovk]]/route.ts', [
      `const controllers = {
        UserRPC: UserController,
      };`,
    ]);
  });

  await it('New custom controller and state', async () => {
    await createNextApp();
    await vovkInit('--yes --validation-library=none');
    await runAtProjectDir('../dist/index.mjs new segment');
    await assertFile('src/app/api/[[...vovk]]/route.ts', [
      `const controllers = {};`,
      `initVovk({
        emitSchema: true,
        controllers, 
      });`,
    ]);
    await updateConfigProperty(
      path.join(cwd, dir, 'vovk.config.js'),
      ['templates', 'state'],
      '../test/new/custom-state.ts.ejs'
    );
    await updateConfigProperty(
      path.join(cwd, dir, 'vovk.config.js'),
      ['templates', 'controller'],
      '../test/new/custom-controller.ts.ejs'
    );
    await runAtProjectDir('../dist/index.mjs new c state user');

    await assertFile('src/modules/user/UserCustomController.ts', [
      `// hello user
        export default class UserCustomController {}`,
    ]);
    await assertFile('src/modules/user/UserState.ts', [`// this is the custom "User" state`]);
    await assertFile('src/app/api/[[...vovk]]/route.ts', [
      `import UserCustomController from '../../../modules/user/UserCustomController';`,
      `const controllers = {
        UserRPC: UserCustomController,
      };`,
      `initVovk({
        emitSchema: true,
        controllers, 
      });`,
    ]);
  });
});
