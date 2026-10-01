import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import { after, beforeEach, describe, it } from 'node:test';
import { createProject, getFreePort, runCLI } from '../../lib/minimal-project.mts';

const projectDir = path.join(process.cwd(), 'tmp_new_without_next');
const read = (file: string) => fs.readFile(path.join(projectDir, file), 'utf-8');

beforeEach(async () => {
  await createProject(projectDir, {
    'package.json': { name: 'app', version: '1.0.0', type: 'module' },
    'tsconfig.json': { compilerOptions: { moduleResolution: 'bundler' } },
    'vovk.config.mjs': 'export default {};',
    'src/app/layout.tsx': '',
  });
});

after(async () => {
  await fs.rm(projectDir, { recursive: true, force: true });
});

await describe('vovk new in a project without Next.js', async () => {
  await it('Writes a module to an absolute --out and adds it to the segment', async () => {
    await runCLI(['new', 'segment'], { cwd: projectDir });
    await runCLI(['new', 'controller', 'inbox', '--out', path.join(projectDir, 'elsewhere', 'inbox')], {
      cwd: projectDir,
    });

    assert.match(await read('elsewhere/inbox/inbox-controller.ts'), /@prefix\('inboxes'\)/);
    assert.match(
      await read('src/app/api/[[...vovk]]/route.ts'),
      /import InboxController from '\.\.\/\.\.\/\.\.\/\.\.\/elsewhere\/inbox\/inbox-controller';/
    );
  });

  await it('Leaves the segment as it is with --no-segment-update', async () => {
    await runCLI(['new', 'segment'], { cwd: projectDir });
    const route = await read('src/app/api/[[...vovk]]/route.ts');

    await runCLI(['new', 'controller', 'user', '--no-segment-update'], { cwd: projectDir });

    assert.match(await read('src/modules/user/user-controller.ts'), /export default class UserController/);
    assert.strictEqual(await read('src/app/api/[[...vovk]]/route.ts'), route);
  });

  await it('Writes no file of a module when one of its files exists', async () => {
    await runCLI(['new', 'segment'], { cwd: projectDir });
    const existingController = path.join(projectDir, 'src/modules/user/user-controller.ts');
    await fs.mkdir(path.dirname(existingController), { recursive: true });
    await fs.writeFile(existingController, '// my controller\n');
    const route = await read('src/app/api/[[...vovk]]/route.ts');

    await assert.rejects(
      runCLI(['new', 'service', 'controller', 'user'], { cwd: projectDir }),
      (error: Error & { stderr: string }) => {
        assert.ok(error.stderr.includes(existingController), error.stderr);
        return true;
      }
    );

    await assert.rejects(fs.stat(path.join(projectDir, 'src/modules/user/user-service.ts')), { code: 'ENOENT' });
    assert.strictEqual(await read('src/modules/user/user-controller.ts'), '// my controller\n');
    assert.strictEqual(await read('src/app/api/[[...vovk]]/route.ts'), route);
  });

  await it('Refuses a module name that is no identifier', async () => {
    await runCLI(['new', 'segment'], { cwd: projectDir });

    await assert.rejects(
      runCLI(['new', 'controller', '2fa'], { cwd: projectDir }),
      (error: Error & { stderr: string }) => {
        assert.match(error.stderr, /Invalid module name "2fa"/);
        return true;
      }
    );

    await assert.rejects(fs.stat(path.join(projectDir, 'src/modules/2-fa')), { code: 'ENOENT' });
  });

  await it('Refuses a segment named "root" in any letter case', async () => {
    for (const segmentName of ['root', 'Root']) {
      await assert.rejects(
        runCLI(['new', 'segment', segmentName], { cwd: projectDir }),
        (error: Error & { stderr: string }) => {
          assert.match(error.stderr, new RegExp(`A segment can't be named "${segmentName}"`));
          return true;
        }
      );

      await assert.rejects(fs.stat(path.join(projectDir, 'src/app/api', segmentName)), { code: 'ENOENT' });
    }
  });

  await it('Works offline with a remote OpenAPI mixin in the config', async () => {
    // nothing listens there, like a spec host out of reach
    const specUrl = `http://127.0.0.1:${await getFreePort()}/openapi.json`;
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'tsconfig.json': { compilerOptions: { moduleResolution: 'bundler' } },
      'vovk.config.mjs': `export default ${JSON.stringify({
        outputConfig: { segments: { petstore: { openAPIMixin: { source: { url: specUrl } } } } },
      })};`,
      'src/app/layout.tsx': '',
    });

    await runCLI(['new', 'segment'], { cwd: projectDir });
    const { stdout } = await runCLI(['new', 'controller', 'user', '--dry-run'], { cwd: projectDir });

    assert.match(stdout, /Dry run: would create/);
  });
});
