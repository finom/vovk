import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { createProject, runCLI, userSegmentSchema } from '../../lib/minimal-project.mts';

const projectDir = path.join(process.cwd(), 'tmp_bundle_without_next');
const read = (file: string) => fs.readFile(path.join(projectDir, file), 'utf-8');
const exists = async (file: string) => !!(await fs.stat(path.join(projectDir, file)).catch(() => null));

// the bundler is not under test, so the build only marks the output directory
const configFile = (bundle: object = {}) => `export default {
  composedClient: { prettifyClient: false },
  bundle: {
    ...${JSON.stringify(bundle)},
    build: async ({ outDir }) => {
      const fs = await import('node:fs');
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(outDir + '/index.js', '// bundled');
    },
  },
};`;

const adminSegmentSchema = {
  ...userSegmentSchema,
  segmentName: 'admin',
  controllers: { AdminRPC: { ...userSegmentSchema.controllers.UserRPC, rpcModuleName: 'AdminRPC' } },
};

const petsSpec = {
  openapi: '3.1.0',
  info: { title: 'Pets', version: '1.0.0' },
  paths: { '/pets': { get: { operationId: 'listPets', responses: { 200: { description: 'OK' } } } } },
};

const createApp = (bundle?: object) =>
  createProject(projectDir, {
    'package.json': { name: 'app', version: '1.0.0', type: 'module' },
    'vovk.config.mjs': configFile(bundle),
    'src/app/api/[[...vovk]]/route.ts': '',
    'src/app/api/admin/[[...vovk]]/route.ts': '',
    'src/keep.ts': 'export const keep = 1;',
    '.vovk-schema/root.json': userSegmentSchema,
    '.vovk-schema/admin.json': adminSegmentSchema,
    'pets.json': petsSpec,
  });

after(async () => {
  await fs.rm(projectDir, { recursive: true, force: true });
});

await describe('vovk bundle in a project without Next.js', async () => {
  await it('Describes the bundled segments and mixins in README.md', async () => {
    const openapiFlags = ['--openapi', 'pets.json', '--openapi-root-url', 'https://pets.example.com'];
    openapiFlags.push('--openapi-module-name', 'PetsRPC', '--openapi-mixin-name', 'pets');
    const runs: [object | undefined, string[]][] = [
      [undefined, ['--exclude', 'admin', ...openapiFlags]],
      [{ excludeSegments: ['admin'] }, openapiFlags],
    ];

    for (const [bundle, flags] of runs) {
      await createApp(bundle);
      await runCLI(['bundle', '--keep-prebundle-dir', ...flags], { cwd: projectDir });

      const code = await read('tmp_prebundle/index.ts');
      const readme = await read('dist/README.md');
      for (const text of [code, readme]) {
        assert.ok(text.includes('UserRPC') && text.includes('PetsRPC') && !text.includes('AdminRPC'), text);
      }
    }
  });

  await it('Refuses a prebundle dir that holds other files or overlaps the bundle out dir', async () => {
    await createApp();
    await fs.mkdir(path.join(projectDir, 'dist'));
    await fs.writeFile(path.join(projectDir, 'dist/old.js'), '// an earlier bundle');

    const runs = [
      ['--prebundle-out', 'src'],
      ['--prebundle-out', '.vovk-schema'],
      ['--prebundle-out', 'package.json'],
      ['--prebundle-out', 'dist'],
      ['--prebundle-out', 'dist/prebundle'],
      ['--prebundle-out', 'build', '--out', 'build/dist'],
    ];

    for (const flags of runs) {
      await assert.rejects(runCLI(['bundle', ...flags], { cwd: projectDir }), /Invalid prebundle output directory/);
    }

    for (const file of ['src/keep.ts', '.vovk-schema/root.json', 'package.json', 'dist/old.js']) {
      assert.ok(await exists(file), `${file} survived`);
    }
  });

  await it('Reuses a prebundle dir kept by an earlier bundle', async () => {
    await createApp({ keepPrebundleDir: true });

    await runCLI(['bundle'], { cwd: projectDir });
    await runCLI(['bundle', '--exclude', 'admin'], { cwd: projectDir });
    assert.ok(!(await read('tmp_prebundle/index.ts')).includes('AdminRPC'));

    await runCLI(['bundle', '--prebundle-out', 'tmp_prebundle'], { cwd: projectDir });
    assert.ok(await exists('dist/index.js'));
  });
});
