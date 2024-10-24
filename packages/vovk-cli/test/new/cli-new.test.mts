// 1. new segment
// 2. new controller + service: null, zod, yup, dto; different segments
// 4. new controller: null, zod, yup, dto
// 3. new worker: null
// 6. new state (modify config so it has state); different segments
// 7. new state + custom controller (modify config so it has state and custom controller)
// 8. rootSegmentModulesDirName

// before each: set up next.js and vovk project


import { it, describe } from 'node:test';
import path from 'node:path';
import fs from 'node:fs/promises';
import getCLIAssertions from '../lib/getCLIAssertions.mjs';
import { DOWN, ENTER, runScript } from '../lib/runScript.mjs';
import omit from 'lodash/omit.js';

await describe('CLI New', async () => {
  const dir = 'tmp_test_dir';
  const cwd = path.resolve(import.meta.dirname, '../../..');

  const {
    createNextApp,
    vovkInit,
    assertConfig,
    assertScripts,
    assertDirExists,
    assertDeps,
    assertFileExists,
    assertNotExists,
    assertTsConfig,
  } = getCLIAssertions({ cwd, dir });

  await it('New root Segment', async () => {});
  await it('New simple Segment', async () => {});
  await it('New nested Segment', async () => {});
});