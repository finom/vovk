import { it, describe } from 'node:test';
import path from 'node:path';
import getCLIAssertions from '../lib/getCLIAssertions.mjs';

await describe.only('CLI new worker only', async () => {
  const { runAtProjectDir, createNextApp, vovkInit, assertFile } = getCLIAssertions({ 
    cwd: path.resolve(import.meta.dirname, '../../..'),
    dir: 'tmp_test_dir'
  });

  await it.only('New worker', async () => {
    await createNextApp();
    await vovkInit('--yes');
    await runAtProjectDir('../dist/index.mjs new segment');
    await assertFile('src/app/api/[[...vovk]]/route.ts', [
      `const workers = {};`,
      `initVovk({
        emitSchema: true,
        workers,
        controllers, 
      });`,
    ]);
    await runAtProjectDir('../dist/index.mjs new worker user');

    await assertFile(
      'src/modules/user/UserWorker.ts',
      [`@worker()
        export default class UserWorker {
        static heavyComputation = (`],
    );
    await assertFile('src/app/api/[[...vovk]]/route.ts', [
      `import UserWorker from '../../../modules/user/UserWorker';`,
      `const workers = {
        UserWPC: UserWorker
      };`,
      `initVovk({
        emitSchema: true,
        workers,
        controllers, 
      });`,
    ]);

    await runAtProjectDir('../dist/index.mjs new worker post');
    await assertFile('src/modules/post/PostWorker.ts', [
      `@worker()
        export default class PostWorker {
        static heavyComputation = (`,
    ]);
    await assertFile('src/app/api/[[...vovk]]/route.ts', [
      `import PostWorker from '../../../modules/post/PostWorker';`,
      `const workers = {
        UserWPC: UserWorker,
        PostWPC: PostWorker
      };`,
      `initVovk({
        emitSchema: true,
        workers,
        controllers, 
      });`,
    ]);
  });
});
