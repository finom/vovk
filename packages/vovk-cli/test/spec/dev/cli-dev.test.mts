import { it, describe } from 'node:test';
import path from 'node:path';
import fs from 'node:fs/promises';
import assert from 'node:assert';
import type { VovkSegmentSchema } from 'vovk';
import { Agent, setGlobalDispatcher } from 'undici';
import getCLIAssertions from '../../lib/getCLIAssertions.mts';

let dev: Promise<string> & {
  kill: () => void;
};

await describe('CLI dev', async () => {
  const cwd = path.resolve(import.meta.dirname, '../../..');
  const dir = 'tmp_test_dir';
  const { runAtProjectDir, createNextApp, vovkInit, assertFile } = getCLIAssertions({ cwd, dir });
  const getSchema = async () =>
    JSON.parse(await fs.readFile(path.join(cwd, dir, '.vovk-schema/root.json'), 'utf8')) as VovkSegmentSchema;

  const agent = new Agent({
    connect: {
      rejectUnauthorized: false,
    },
  });

  setGlobalDispatcher(agent);

  const devCommands = {
    Implicit: '../dist/index.mjs dev --next-dev',
    'Implicit with --https': '../dist/index.mjs dev --next-dev --https -- --experimental-https',
    Explicit: 'npx concurrently "npx next dev" "../dist/index.mjs dev" --kill-others',
    'Explicit with --https':
      'npx concurrently "npx next dev --experimental-https" "../dist/index.mjs dev --https" --kill-others',
  };

  const PORT = 3420;

  for (const [name, devCommand] of Object.entries(devCommands)) {
    await it(name, async () => {
      await createNextApp();
      await vovkInit('--yes --validation-library=none');
      try {
        await runAtProjectDir('../dist/index.mjs new segment');
        await assertFile('src/app/api/[[...vovk]]/route.ts', [
          `const controllers = {};`,
          `initSegment({
                emitSchema: true,
                controllers, 
            });`,
        ]);
        dev = runAtProjectDir(devCommand, { env: { PORT } });
        await new Promise((resolve) => setTimeout(resolve, 10_000));

        await runAtProjectDir('../dist/index.mjs new controller user');

        await assertFile('src/modules/user/UserController.ts', [
          `export default class UserController {`,
          `@get()`,
          `static getUsers = async (`,
        ]);

        await assertFile('src/app/api/[[...vovk]]/route.ts', [
          `import UserController from '../../../modules/user/UserController';`,
          `const controllers = {
            UserRPC: UserController,
        };`,
          `initSegment({
            emitSchema: true,
            controllers, 
        });`,
        ]);

        await new Promise((resolve) => setTimeout(resolve, 10_000));

        assert.strictEqual((await getSchema()).controllers.UserRPC.rpcModuleName, 'UserRPC');
        assert.ok((await getSchema()).controllers.UserRPC.handlers.getUsers);

        const segmentAbsolutePath = path.join(cwd, dir, 'src/app/api/[[...vovk]]/route.ts');
        const controllerAbsolutePath = path.join(cwd, dir, 'src/modules/user/UserController.ts');

        const segmentCode = await fs.readFile(segmentAbsolutePath, 'utf8');

        await fs.writeFile(segmentAbsolutePath, segmentCode.replace('UserRPC', 'CustomUserRPC'));

        await new Promise((resolve) => setTimeout(resolve, 10_000));

        assert.strictEqual((await getSchema()).controllers.CustomUserRPC.rpcModuleName, 'CustomUserRPC');

        const controllerCode = await fs.readFile(controllerAbsolutePath, 'utf8');

        await fs.writeFile(controllerAbsolutePath, controllerCode.replace('getUsers', 'getPeople'));

        await new Promise((resolve) => setTimeout(resolve, 10_000));

        assert.ok((await getSchema()).controllers.CustomUserRPC.handlers.getPeople);
        const protocol = name.includes('--https') ? 'https' : 'http';
        const resp = await (await fetch(`${protocol}://localhost:${PORT}/api/users?search=hello1`)).json();

        assert.deepStrictEqual(resp, {
          results: [],
          search: 'hello1',
        });
        dev.kill();
      } catch (error) {
        dev.kill();
        throw error;
      }
    });
  }
});
