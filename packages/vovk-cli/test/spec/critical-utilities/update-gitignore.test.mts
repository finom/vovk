import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import { after, describe, it, mock } from 'node:test';
import { updateGitignore } from '../../../dist/init/update-gitignore.mjs';
import { createProject } from '../../lib/minimal-project.mts';

const projectDir = path.join(process.cwd(), 'tmp_update_gitignore');

after(async () => {
  await fs.rm(projectDir, { recursive: true, force: true });
});

await describe('updateGitignore', async () => {
  await it('Writes the client folder with forward slashes on Windows', async () => {
    await createProject(projectDir, { 'src/app/layout.tsx': '' });
    const posixJoin = path.posix.join.bind(path.posix);
    // path.join as on Windows for the relative client folder; the absolute file paths stay usable here
    const join = mock.method(path, 'join', (...segments: string[]) =>
      path.isAbsolute(segments[0]) ? posixJoin(...segments) : path.win32.join(...segments)
    );

    let entry: string | null;
    try {
      entry = await updateGitignore(projectDir);
    } finally {
      join.mock.restore();
    }

    // git reads "\" in .gitignore as an escape, so "/src\client" would match nothing
    assert.strictEqual(entry, '/src/client');
    assert.match(await fs.readFile(path.join(projectDir, '.gitignore'), 'utf-8'), /^\/src\/client$/m);
  });
});
