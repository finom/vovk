import assert from 'node:assert';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import * as prettier from 'prettier';
import { createProject, runCLI } from '../../lib/minimal-project.mts';

// outside the monorepo, so the CLI finds no prettier and writes the templates as they render
const root = await fs.mkdtemp(path.join(os.tmpdir(), 'vovk-new-without-prettier-'));

after(async () => {
  await fs.rm(root, { recursive: true, force: true });
});

const assertFormatted = async (file: string) => {
  const code = await fs.readFile(file, 'utf-8');
  const formatted = await prettier.format(code, { filepath: file, singleQuote: true, printWidth: 120 });
  assert.strictEqual(code, formatted, `${path.basename(file)} differs from its prettier output`);
};

await describe('vovk new in a project without prettier', async () => {
  for (const library of ['zod', 'valibot', 'arktype', 'type']) {
    await it(`Writes formatted ${library} modules and segment code`, async () => {
      const projectDir = path.join(root, library);
      await createProject(projectDir, {
        'package.json': { name: 'app', version: '1.0.0', type: 'module' },
        'tsconfig.json': { compilerOptions: { moduleResolution: 'bundler' } },
        'vovk.config.mjs': `export default { moduleTemplates: { controller: 'vovk-cli/module-templates/${library}/controller.ts.ejs' } };`,
        'src/app/layout.tsx': '',
      });

      await runCLI(['new', 'segment'], { cwd: projectDir });
      await runCLI(['new', 'controller', 'service', 'user'], { cwd: projectDir });
      await runCLI(['new', 'controller', 'post'], { cwd: projectDir });

      await assertFormatted(path.join(projectDir, 'src/modules/user/user-controller.ts'));
      await assertFormatted(path.join(projectDir, 'src/modules/user/user-service.ts'));
      await assertFormatted(path.join(projectDir, 'src/modules/post/post-controller.ts'));
      await assertFormatted(path.join(projectDir, 'src/app/api/[[...vovk]]/route.ts'));
    });
  }
});
