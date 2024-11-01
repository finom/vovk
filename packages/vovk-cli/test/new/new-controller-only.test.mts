import { it, describe } from 'node:test';
import path from 'node:path';
import getCLIAssertions from '../lib/getCLIAssertions.mjs';

// TODO new controller: zod, yup, dto

await describe('CLI new controller only', async () => {
  const { runAtProjectDir, createNextApp, vovkInit, assertFile } = getCLIAssertions({ 
    cwd: path.resolve(import.meta.dirname, '../../..'),
    dir: 'tmp_test_dir'
  });

  await it('New controller (user and post)', async () => {
    await createNextApp();
    await vovkInit('--yes --validation-library=none');
    await runAtProjectDir('../dist/index.mjs new segment');
    await assertFile('src/app/api/[[...vovk]]/route.ts', [
      `const controllers = {};`,
      `initVovk({
        emitSchema: true,
        workers,
        controllers, 
      });`,
    ]);
    await runAtProjectDir('../dist/index.mjs new controller user');

    await assertFile(
      'src/modules/user/UserController.ts',
      [`export default class UserController {
        @get()
        static getUsers = async (`,
      `static createUser = `,
      `static updateUser = `],
    );
    await assertFile('src/app/api/[[...vovk]]/route.ts', [
      `import UserController from '../../../modules/user/UserController';`,
      `const controllers = {
        UserRPC: UserController
      };`,
      `initVovk({
        emitSchema: true,
        workers,
        controllers, 
      });`,
    ]);

    await runAtProjectDir('../dist/index.mjs new controller post');
    await assertFile('src/modules/post/PostController.ts', [
      `export default class PostController {
        @get()
        static getPosts = async (`,
      `static createPost = `,
      `static updatePost = `,
    ]);
    await assertFile('src/app/api/[[...vovk]]/route.ts', [
      `import PostController from '../../../modules/post/PostController';`,
      `const controllers = {
        UserRPC: UserController,
        PostRPC: PostController
      };`,
      `initVovk({
        emitSchema: true,
        workers,
        controllers, 
      });`,
    ]);
  });
});
