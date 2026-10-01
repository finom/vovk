import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { createProject, runCLI } from '../../lib/minimal-project.mts';

const projectDir = path.join(process.cwd(), 'tmp_init_without_next');
const read = (file: string) => fs.readFile(path.join(projectDir, file), 'utf-8');

after(async () => {
  await fs.rm(projectDir, { recursive: true, force: true });
});

// test runs add the vovk packages of this repo, so these need no registry
const init = () =>
  runCLI(['init', '--yes', '--skip-install', '--validation-library=none'], {
    cwd: projectDir,
    env: { NODE_ENV: 'test' },
  });

await describe('vovk init in a project without Next.js', async () => {
  await it('Keeps a customized config as a backup', async () => {
    const customConfig = `export default { modulesDir: './lib/modules', outputConfig: { origin: 'https://example.com' } };\n`;
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', scripts: { dev: 'next dev' } },
      'tsconfig.json': { compilerOptions: {} },
      'src/app/layout.tsx': '',
      'vovk.config.mjs': customConfig,
    });

    const { stdout, stderr } = await init();

    assert.strictEqual(await read('vovk.config.mjs.bak'), customConfig);
    assert.match(await read('vovk.config.mjs'), /moduleTemplates/);
    assert.match(stdout + stderr, /vovk\.config\.mjs\.bak/);

    // the config init wrote itself needs no backup
    const config = await read('vovk.config.mjs');
    await init();
    assert.strictEqual(await read('vovk.config.mjs'), config);
    await assert.rejects(fs.stat(path.join(projectDir, 'vovk.config.mjs.bak.1')), { code: 'ENOENT' });
  });
});
