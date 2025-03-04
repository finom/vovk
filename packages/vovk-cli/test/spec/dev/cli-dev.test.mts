import { it, describe } from 'node:test';
import path from 'node:path';
import fs from 'node:fs/promises';
import getCLIAssertions from '../../lib/getCLIAssertions.mts';
import { VovkSegmentSchema } from 'vovk';
import assert from 'node:assert';

let dev: Promise<string> & {
  kill: () => void;
};

await describe('CLI dev', async () => {
  const cwd = path.resolve(import.meta.dirname, '../../..');
  const dir = 'tmp_test_dir';
  const { runAtProjectDir, createNextApp, vovkInit, assertFile } = getCLIAssertions({ cwd, dir });
  const getSchema = async () =>
    JSON.parse(await fs.readFile(path.join(cwd, dir, '.vovk-schema/_root.json'), 'utf8')) as VovkSegmentSchema;

  const devCommands = {
    Implicit: '../dist/index.mjs dev --next-dev',
    Explicit: 'npx concurrently "npx next dev" "../dist/index.mjs dev" --kill-others',
  };

  for (const [name, devCommand] of Object.entries(devCommands)) {
    await it(name, async () => {
      await createNextApp();
      await vovkInit('--yes --validation-library=none');
      try {
        await runAtProjectDir('../dist/index.mjs new segment');
        await assertFile('src/app/api/[[...vovk]]/route.ts', [
          `const controllers = {};`,
          `initVovk({
                emitSchema: true,
                controllers, 
            });`,
        ]);
        dev = runAtProjectDir(devCommand, name === 'Explicit' ? { env: { PORT: 3420 } } : undefined);
        await new Promise((resolve) => setTimeout(resolve, 10_000));

        await runAtProjectDir('../dist/index.mjs new controller user');

        await assertFile('src/modules/user/UserController.ts', [
          `export default class UserController {
        @get()
        static getUsers = async (`,
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

        await new Promise((resolve) => setTimeout(resolve, 10_000));

        assert.strictEqual((await getSchema()).controllers.UserRPC.controllerName, 'UserRPC');
        assert.ok((await getSchema()).controllers.UserRPC.handlers.getUsers);

        const segmentAbsolutePath = path.join(cwd, dir, 'src/app/api/[[...vovk]]/route.ts');
        const controllerAbsolutePath = path.join(cwd, dir, 'src/modules/user/UserController.ts');

        const segmentCode = await fs.readFile(segmentAbsolutePath, 'utf8');

        await fs.writeFile(segmentAbsolutePath, segmentCode.replace('UserRPC', 'CustomUserRPC'));

        await new Promise((resolve) => setTimeout(resolve, 10_000));

        assert.strictEqual((await getSchema()).controllers.CustomUserRPC.controllerName, 'CustomUserRPC');

        const controllerCode = await fs.readFile(controllerAbsolutePath, 'utf8');

        await fs.writeFile(controllerAbsolutePath, controllerCode.replace('getUsers', 'getPeople'));

        await new Promise((resolve) => setTimeout(resolve, 10_000));

        assert.ok((await getSchema()).controllers.CustomUserRPC.handlers.getPeople);
        dev.kill();
      } catch (error) {
        dev.kill();
        throw error;
      }
    });
  }
});
