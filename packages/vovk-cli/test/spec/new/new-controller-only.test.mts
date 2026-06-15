import path from 'node:path';
import { describe, it } from 'node:test';
import getCLIAssertions from '../../lib/get-cli-assertions.mts';

await describe('CLI new controller only', async () => {
  const { runAtProjectDir, assertFile, assertNotExists, createVovkApp } = getCLIAssertions({
    cwd: path.resolve(import.meta.dirname, '../../..'),
    dir: 'tmp_test_dir_new_controller_only',
  });

  await it('New controller without validation library', async () => {
    await createVovkApp({
      vovkInitFlags: '--yes --validation-library=none',
    });
    await runAtProjectDir('../dist/index.mjs new segment');
    await assertFile('src/app/api/[[...vovk]]/route.ts', [
      `const controllers = {};`,
      `initSegment({
        emitSchema: true,
        controllers, 
      });`,
    ]);
    await runAtProjectDir('../dist/index.mjs new controller user');

    await assertFile('src/modules/user/user-controller.ts', [
      `export default class UserController {`,
      `@get()
        static getUsers = (`,
      `static createUser = `,
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

    await runAtProjectDir('../dist/index.mjs new controller post');
    await assertFile('src/modules/post/post-controller.ts', [
      `export default class PostController {`,
      `@get()
        static getPosts = (`,
      `static createPost = `,
      `static updatePost = `,
    ]);
    await assertFile('src/app/api/[[...vovk]]/route.ts', [
      `import PostController from '../../../modules/post/post-controller';`,
      `const controllers = {
        UserRPC: UserController,
        PostRPC: PostController,
      };`,
      `initSegment({
        emitSchema: true,
        controllers, 
      });`,
    ]);
  });

  await it('New --empty controller only', async () => {
    await createVovkApp({
      vovkInitFlags: '--yes',
    });
    await runAtProjectDir('../dist/index.mjs new segment');
    await runAtProjectDir('../dist/index.mjs new controller user --empty');

    await assertFile('src/modules/user/user-controller.ts', [`export default class UserController {}`]);
    await assertNotExists('src/modules/user/user-service.ts');
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

  await it('New controller on non-root segment', async () => {
    await createVovkApp({
      vovkInitFlags: '--yes --validation-library=none',
    });
    await runAtProjectDir('../dist/index.mjs new segment foo');
    await assertFile('src/app/api/foo/[[...vovk]]/route.ts', [
      `const controllers = {};`,
      `initSegment({
        segmentName: 'foo',
        emitSchema: true,
        controllers, 
      });`,
    ]);
    await runAtProjectDir('../dist/index.mjs new controller foo/user');

    await assertFile('src/modules/foo/user/user-controller.ts', [
      `export default class UserController {`,
      `@get()
        static getUsers = (`,
      `static createUser = `,
      `static updateUser = `,
    ]);
    await assertFile('src/app/api/foo/[[...vovk]]/route.ts', [
      `import UserController from '../../../../modules/foo/user/user-controller';`,
      `const controllers = {
        UserRPC: UserController,
      };`,
      `initSegment({
        segmentName: 'foo',
        emitSchema: true,
        controllers, 
      });`,
    ]);
  });

  await it('New controller with zod validation library', async () => {
    await createVovkApp({
      vovkInitFlags: '--yes --validation-library=zod',
    });
    await runAtProjectDir('../dist/index.mjs new segment');
    await assertFile('src/app/api/[[...vovk]]/route.ts', [
      `const controllers = {};`,
      `initSegment({
        emitSchema: true,
        controllers, 
      });`,
    ]);
    await runAtProjectDir('../dist/index.mjs new controller user');

    await assertFile('src/modules/user/user-controller.ts', [
      `import { z } from 'zod';`,
      `export default class UserController {`,
      `@get()
        static getUsers = procedure(`,
      `static createUser = `,
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

  await it('New controller with valibot validation library', async () => {
    await createVovkApp({
      vovkInitFlags: '--yes --validation-library=valibot',
    });
    await runAtProjectDir('../dist/index.mjs new segment');
    await assertFile('src/app/api/[[...vovk]]/route.ts', [
      `const controllers = {};`,
      `initSegment({
        emitSchema: true,
        controllers, 
      });`,
    ]);
    await runAtProjectDir('../dist/index.mjs new controller user');

    await assertFile('src/modules/user/user-controller.ts', [
      `import * as v from 'valibot';`,
      `export default class UserController {`,
      `@get()
        static getUsers = procedure(`,
      `static createUser = `,
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

  await it('New controller with arktype validation library', async () => {
    await createVovkApp({
      vovkInitFlags: '--yes --validation-library=arktype',
    });
    await runAtProjectDir('../dist/index.mjs new segment');
    await assertFile('src/app/api/[[...vovk]]/route.ts', [
      `const controllers = {};`,
      `initSegment({
        emitSchema: true,
        controllers, 
      });`,
    ]);
    await runAtProjectDir('../dist/index.mjs new controller user');

    await assertFile('src/modules/user/user-controller.ts', [
      `import { type } from 'arktype';`,
      `export default class UserController {`,
      `@get()
        static getUsers = procedure(`,
      `static createUser = `,
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
});
