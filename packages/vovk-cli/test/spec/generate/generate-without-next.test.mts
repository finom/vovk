import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { createProject, runCLI, userSegmentSchema } from '../../lib/minimal-project.mts';

const projectDir = path.join(process.cwd(), 'tmp_generate_without_next');
const read = (file: string) => fs.readFile(path.join(projectDir, file), 'utf-8');
const configFile = (config: object) => `export default ${JSON.stringify(config)};`;

after(async () => {
  await fs.rm(projectDir, { recursive: true, force: true });
});

await describe('vovk generate in a project without Next.js', async () => {
  await it('Writes relative import paths that start with ./ or ../', async () => {
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({
        composedClient: { prettifyClient: false },
        outputConfig: { imports: { fetcher: './src/client/fetcher' } },
      }),
      'src/app/api/[[...vovk]]/route.ts': '',
      '.vovk-schema/root.json': userSegmentSchema,
    });

    await runCLI(['generate'], { cwd: projectDir });

    const index = await read('src/client/index.ts');
    assert.ok(index.includes(`import('./fetcher')`), index);
    assert.ok(index.includes(`from "../app/api/[[...vovk]]/route.ts"`), index);
  });

  await it('Names Python and Rust packages after a scoped package name', async () => {
    await createProject(projectDir, {
      'package.json': { name: '@acme/web-app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({ composedClient: { prettifyClient: false } }),
      '.vovk-schema/root.json': userSegmentSchema,
    });

    await runCLI(['generate', '--from', 'py', '--out', 'dist_python'], { cwd: projectDir });
    await runCLI(['generate', '--from', 'rsPkg', '--out', 'dist_rust'], { cwd: projectDir });

    assert.deepStrictEqual(await fs.readdir(path.join(projectDir, 'dist_python/src')), ['acme_web_app']);
    assert.match(await read('dist_python/pyproject.toml'), /^name = "acme_web_app"$/m);
    assert.match(await read('dist_rust/Cargo.toml'), /^name = "acme_web_app"$/m);
  });

  await it('Falls back to a package name when package.json has none', async () => {
    await createProject(projectDir, {
      'package.json': { private: true, type: 'module' },
      'vovk.config.mjs': configFile({ composedClient: { prettifyClient: false } }),
      '.vovk-schema/root.json': userSegmentSchema,
    });

    await runCLI(['generate', '--from', 'pyPkg', '--from', 'rsPkg', '--out', 'out'], { cwd: projectDir });

    assert.match(await read('out/pyproject.toml'), /^name = "my_package_name"$/m);
    assert.match(await read('out/Cargo.toml'), /^name = "my_package_name"$/m);
  });
});
