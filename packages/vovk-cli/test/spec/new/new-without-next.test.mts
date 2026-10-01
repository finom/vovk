import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import { after, beforeEach, describe, it } from 'node:test';
import { createProject, runCLI } from '../../lib/minimal-project.mts';

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
});
