import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { removeUnlistedDirectories } from '../../../dist/utils/remove-unlisted-directories.mjs';

const tmpDir = path.join(process.cwd(), 'tmp_remove_unlisted');

async function writeFiles(files: string[]) {
  for (const file of files) {
    const absolute = path.join(tmpDir, file);
    await fs.mkdir(path.dirname(absolute), { recursive: true });
    await fs.writeFile(absolute, '// content', 'utf-8');
  }
}

const list = async () => (await fs.readdir(tmpDir)).sort();

beforeEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
  await fs.mkdir(tmpDir, { recursive: true });
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

await describe('removeUnlistedDirectories', async () => {
  await it('Removes stale segment directories and keeps allowed ones', async () => {
    await writeFiles(['root/index.ts', 'foo/index.ts', 'stale/index.ts', 'bar/baz/index.ts']);

    const skipped = await removeUnlistedDirectories(tmpDir, ['root', 'foo', 'bar/baz'], ['index.ts']);

    assert.deepStrictEqual(await list(), ['bar', 'foo', 'root']);
    assert.deepStrictEqual(skipped, []);
  });

  await it('Removes a stale nested segment directory', async () => {
    await writeFiles(['foo/index.ts', 'bar/baz/index.ts']);

    const skipped = await removeUnlistedDirectories(tmpDir, ['foo'], ['index.ts']);

    assert.deepStrictEqual(await list(), ['foo']);
    assert.deepStrictEqual(skipped, []);
  });

  await it('Keeps directories that hold files the generator did not write', async () => {
    await writeFiles(['root/index.ts', 'components/Button.tsx', 'hooks/nested/use-thing.ts', 'stale/index.ts']);

    const skipped = await removeUnlistedDirectories(tmpDir, ['root'], ['index.ts']);

    assert.deepStrictEqual(await list(), ['components', 'hooks', 'root']);
    assert.deepStrictEqual(skipped.map((dir) => path.relative(tmpDir, dir)).sort(), ['components', 'hooks']);
  });

  await it('Treats [package_name] as a wildcard segment', async () => {
    await writeFiles(['stale/my_pkg/index.ts', 'user/my_pkg/notes.md']);

    const skipped = await removeUnlistedDirectories(tmpDir, [], ['[package_name]/index.ts']);

    assert.deepStrictEqual(await list(), ['user']);
    assert.deepStrictEqual(
      skipped.map((dir) => path.relative(tmpDir, dir)),
      ['user']
    );
  });

  await it('Removes everything unlisted when no generated paths are given', async () => {
    await writeFiles(['root/index.ts', 'components/Button.tsx']);

    const skipped = await removeUnlistedDirectories(tmpDir, ['root']);

    assert.deepStrictEqual(await list(), ['root']);
    assert.deepStrictEqual(skipped, []);
  });
});
