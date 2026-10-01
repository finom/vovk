import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import { after, describe, it, mock } from 'node:test';
import { resolveAbsoluteModulePath } from '../../../dist/utils/resolve-absolute-module-path.mjs';
import { createProject } from '../../lib/minimal-project.mts';

const projectDir = path.join(process.cwd(), 'tmp_resolve_module_path');
const cliRoot = path.join(import.meta.dirname, '../../..');

after(async () => {
  await fs.rm(projectDir, { recursive: true, force: true });
});

await describe('resolveAbsoluteModulePath', async () => {
  await it('Resolves a template package installed only in the project, without noise', async () => {
    // the CLI can't resolve this package from its own location, as under npx or pnpm
    await createProject(projectDir, {
      'node_modules/my-templates/package.json': { name: 'my-templates', version: '1.0.0', main: 'index.js' },
      'node_modules/my-templates/index.js': 'module.exports = {};',
    });
    const consoleError = mock.method(console, 'error', () => {});

    try {
      assert.strictEqual(
        resolveAbsoluteModulePath('my-templates/hello/', projectDir),
        path.join(projectDir, 'node_modules/my-templates/hello')
      );
      assert.strictEqual(consoleError.mock.callCount(), 0);
    } finally {
      consoleError.mock.restore();
    }
  });

  await it('Takes the built-in templates from the running CLI', async () => {
    await createProject(projectDir, {
      'node_modules/vovk-cli/package.json': { name: 'vovk-cli', version: '0.0.1', main: 'index.js' },
      'node_modules/vovk-cli/index.js': 'module.exports = {};',
    });

    assert.strictEqual(
      resolveAbsoluteModulePath('vovk-cli/client-templates/ts-base/', projectDir),
      path.join(cliRoot, 'client-templates/ts-base')
    );
  });

  await it('Resolves a relative path from the project', () => {
    assert.strictEqual(
      resolveAbsoluteModulePath('./templates/state.ts.ejs', projectDir),
      path.join(projectDir, 'templates/state.ts.ejs')
    );
  });
});
