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

    let entries: string[];
    try {
      entries = await updateGitignore(projectDir);
    } finally {
      join.mock.restore();
    }

    // git reads "\" in .gitignore as an escape, so "/src\client" would match nothing
    assert.deepStrictEqual(entries, ['/src/client']);
    assert.match(await fs.readFile(path.join(projectDir, '.gitignore'), 'utf-8'), /^\/src\/client$/m);
  });

  await it('Adds the Python and Rust packages for --lang, once', async () => {
    await createProject(projectDir, { 'src/app/layout.tsx': '', '.gitignore': '/dist_rust/\n' });

    assert.deepStrictEqual(await updateGitignore(projectDir, ['py', 'rs']), ['/src/client', '/dist_python']);
    assert.deepStrictEqual(await updateGitignore(projectDir, ['py', 'rs']), []);
    const lines = (await fs.readFile(path.join(projectDir, '.gitignore'), 'utf-8')).split('\n');
    for (const entry of ['/src/client', '/dist_python']) {
      assert.strictEqual(lines.filter((line) => line === entry).length, 1, entry);
    }
    assert.ok(!lines.includes('/dist_rust'));
  });
});
