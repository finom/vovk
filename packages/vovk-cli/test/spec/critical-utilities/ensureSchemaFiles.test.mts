import assert from 'node:assert';
import { it, describe, beforeEach, afterEach, before } from 'node:test';
import fs from 'node:fs/promises';
import path from 'node:path';
import * as glob from 'glob';
import ensureSchemaFiles from '../../../dist/dev/ensureSchemaFiles.mjs';
import getProjectInfo, { type ProjectInfo } from '../../../dist/getProjectInfo/index.mjs';

const tmpDir = path.join(process.cwd(), 'tmp');

// Helper function to clear and create a temporary directory
async function setupTmpDir() {
  await cleanupTmpDir();
  await fs.mkdir(path.join(tmpDir, 'app'), { recursive: true });
}

async function cleanupTmpDir() {
  await fs.rm(tmpDir, { recursive: true, force: true });
}

let projectInfo: ProjectInfo;

before(async () => {
  await setupTmpDir();
  projectInfo = await getProjectInfo({ cwd: tmpDir });
});

beforeEach(async () => {
  await setupTmpDir();
});

afterEach(async () => {
  await cleanupTmpDir();
});

await describe('ensureSchemaFiles', async () => {
  await it('ensureSchemaFiles creates and removes files correctly with nested segments', async () => {
    const initialSegments = ['segment1', 'segment2', 'folder1/segment3', 'folder2/segment4'];

    // Run the function with the initial segments
    await ensureSchemaFiles(projectInfo, tmpDir, initialSegments);

    // Check if files are created
    let files = glob.sync('**/*.json', { cwd: tmpDir });
    assert.deepStrictEqual(
      files.sort(),
      [
        'config.json',
        'segments/segment1.json',
        'segments/segment2.json',
        'segments/folder1/segment3.json',
        'segments/folder2/segment4.json',
      ].sort()
    );

    const indexPath = path.join(tmpDir, 'main.cjs');
    const expectedIndexContent = `module.exports.config = require('./config.json');
module.exports.segments = {
  'segment1': require('./segments/segment1.json'),
  'segment2': require('./segments/segment2.json'),
  'folder1/segment3': require('./segments/folder1/segment3.json'),
  'folder2/segment4': require('./segments/folder2/segment4.json'),
}`;

    const indexContent = await fs.readFile(indexPath, 'utf-8');
    assert.strictEqual(indexContent.trim().split('\n').slice(1).join('\n'), expectedIndexContent.trim());

    // Update the segments list (segment2 and segment3 remain, segment1 and segment4 are removed, segment5 is added)
    const updatedSegments = ['segment2', 'folder1/segment3', 'segment5'];

    // Run the function with the updated segments
    await ensureSchemaFiles(projectInfo, tmpDir, updatedSegments);

    // Check if files are updated correctly
    files = glob.sync('**/*.json', { cwd: tmpDir });
    assert.deepStrictEqual(
      files.sort(),
      ['config.json', 'segments/folder1/segment3.json', 'segments/segment2.json', 'segments/segment5.json'].sort()
    );

    // Check if old files are removed
    const removedFiles = ['segment1.json', 'folder2/segment4.json'];
    for (const file of removedFiles) {
      try {
        await fs.stat(path.join(tmpDir, file));
        assert.fail(`${file} should have been deleted`);
      } catch (error) {
        assert.strictEqual((error as NodeJS.ErrnoException).code, 'ENOENT');
      }
    }

    // Check if the updated index.js file is correct
    const updatedExpectedIndexContent = `module.exports.config = require('./config.json');
module.exports.segments = {
  'segment2': require('./segments/segment2.json'),
  'folder1/segment3': require('./segments/folder1/segment3.json'),
  'segment5': require('./segments/segment5.json'),
}`;

    const updatedIndexContent = await fs.readFile(indexPath, 'utf-8');
    assert.strictEqual(updatedIndexContent.trim().split('\n').slice(1).join('\n'), updatedExpectedIndexContent.trim());
  });
});
