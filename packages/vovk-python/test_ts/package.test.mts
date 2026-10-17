import { strict as assert } from 'node:assert';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';

const cliPath = path.join(import.meta.dirname, '../../vovk-cli/dist/index.mjs');
const hasBuild = spawnSync('python3', ['-c', 'import build, hatchling']).status === 0;
const projectDirs: string[] = [];

after(() => {
  for (const dir of projectDirs) fs.rmSync(dir, { recursive: true, force: true });
});

// generates the py package of a one-endpoint project with these package.json fields, returns its folder
function generate(packageJson: object, outputConfig: object = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vovk-python-package-'));
  projectDirs.push(dir);
  const segment = {
    $schema: 'https://vovk.dev/api/schema/v3/segment.json',
    emitSchema: true,
    segmentName: '',
    segmentType: 'segment',
    controllers: {
      UserRPC: {
        rpcModuleName: 'UserRPC',
        originalControllerName: 'UserController',
        prefix: 'user',
        handlers: { list: { httpMethod: 'GET', path: '', validation: {} } },
      },
    },
  };
  const config = {
    composedClient: { fromTemplates: ['py'], prettifyClient: false },
    outputConfig: { origin: 'https://example.com', ...outputConfig },
  };
  fs.mkdirSync(path.join(dir, '.vovk-schema'));
  fs.writeFileSync(path.join(dir, '.vovk-schema/root.json'), JSON.stringify(segment));
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'app', version: '1.0.0', ...packageJson }));
  fs.writeFileSync(path.join(dir, 'vovk.config.mjs'), `export default ${JSON.stringify(config)};`);
  execFileSync(process.execPath, [cliPath, 'generate'], { cwd: dir, stdio: 'pipe' });
  return path.join(dir, 'dist_python');
}

const read = (dir: string, file: string) => fs.readFileSync(path.join(dir, file), 'utf-8');

// the [project.urls] table of a pyproject.toml, undefined when it has none
function projectUrls(pyproject: string) {
  const [, table] = pyproject.split(/^\s*\[project\.urls\]$/m);
  if (table === undefined) return undefined;
  const [entries] = table.split(/^\s*\[/m);
  return Object.fromEntries([...entries.matchAll(/^\s*(\w+) = "(.*)"$/gm)].map(([, key, value]) => [key, value]));
}

test('the repository becomes an http(s) Source URL, as PyPI requires', () => {
  const cases: [repository: unknown, source: string | undefined][] = [
    // what npm init and npm pkg fix write
    [{ type: 'git', url: 'git+https://github.com/u/r.git' }, 'https://github.com/u/r.git'],
    ['github:u/r', 'https://github.com/u/r'],
    ['u/r', 'https://github.com/u/r'],
    ['gitlab:u/r', 'https://gitlab.com/u/r'],
    ['bitbucket:u/r', 'https://bitbucket.org/u/r'],
    ['gist:11081aaa281', 'https://gist.github.com/11081aaa281'],
    ['git@github.com:u/r.git', 'https://github.com/u/r.git'],
    ['git+ssh://git@github.com/u/r.git', 'https://github.com/u/r.git'],
    ['ssh://git@git.example.com:2222/u/r.git', 'https://git.example.com/u/r.git'],
    ['git://github.com/u/r.git', 'https://github.com/u/r.git'],
    [
      { type: 'git', url: 'https://github.com/finom/vovk.git', directory: 'examples/hello-world' },
      'https://github.com/finom/vovk.git',
    ],
    ['file:../r', undefined],
  ];

  for (const [repository, source] of cases) {
    const urls = projectUrls(read(generate({ repository }), 'pyproject.toml'));
    assert.equal(urls?.Source, source, JSON.stringify(repository));
  }
});

test('http(s) homepage and bugs URLs are written as they are', () => {
  const urls = projectUrls(
    read(generate({ homepage: 'https://x.dev', bugs: { url: 'https://github.com/u/r/issues' } }), 'pyproject.toml')
  );

  assert.deepEqual(urls, { Homepage: 'https://x.dev', Issues: 'https://github.com/u/r/issues' });
});

test('pyproject.toml has no [project.urls] when no URL can be written', () => {
  // npm keeps a bugs field with only an e-mail
  const pyproject = read(generate({ bugs: { email: 'a@x.dev' } }), 'pyproject.toml');

  assert.equal(projectUrls(pyproject), undefined, pyproject);
});

test('a semver prerelease that PEP 440 refuses becomes a PEP 440 version, any other version is kept', () => {
  const cases = [
    // npm version prerelease --preid=next
    ['2.0.0-next.3', '2.0.0.dev3'],
    ['15.0.0-canary.12', '15.0.0.dev12'],
    ['0.0.0-snapshot-20260101', '0.0.0.dev20260101'],
    ['1.0.0-beta.1.2', '1.0.0b1'],
    ['1.0.0-next.3+sha.abc', '1.0.0.dev3+sha.abc'],
    ['1.0.0', '1.0.0'],
    ['1.0.0-beta.1', '1.0.0-beta.1'],
    ['1.0.0-rc.2', '1.0.0-rc.2'],
    ['1.0.0+build.5', '1.0.0+build.5'],
    ['1.0.1-0', '1.0.1-0'],
  ];

  for (const [version, written] of cases) {
    const pyproject = read(generate({ version }), 'pyproject.toml');
    assert.ok(pyproject.includes(`\nversion = "${written}"\n`), `${version}:\n${pyproject}`);
  }
});

test('pyproject.toml has a license only when the package sets one', () => {
  const none = read(generate({}), 'pyproject.toml');
  const mit = read(generate({ license: 'MIT' }), 'pyproject.toml');

  assert.doesNotMatch(none, /license/i);
  assert.match(mit, /^\s*\[project\.license\]\n\s*text = "MIT"$/m);
});

test('the README shows readme.installCommand as written', () => {
  const installCommand = `pip install "app[x]>=1" 'b' --index-url https://x.test/simple?a=1&b=2 && echo <ok>`;
  const readme = read(generate({}, { readme: { installCommand } }), 'README.md');

  assert.ok(readme.includes(`\n${installCommand}\n`), readme);
});

test('the package of an npm-style package.json builds, with metadata PyPI accepts', {
  skip: !hasBuild && 'python3 -m build not found',
}, () => {
  const dir = generate({ version: '2.0.0-next.3', repository: { type: 'git', url: 'git+https://github.com/u/r.git' } });
  const outDir = path.join(path.dirname(dir), 'wheel');
  const build = spawnSync('python3', ['-m', 'build', '--no-isolation', '--wheel', '--outdir', outDir, dir], {
    encoding: 'utf-8',
  });
  assert.equal(build.status, 0, build.stdout + build.stderr);
  const wheel = path.join(outDir, fs.readdirSync(outDir).find((file) => file.endsWith('.whl')) ?? '');
  const printMetadata = [
    'import sys, zipfile',
    'wheel = zipfile.ZipFile(sys.argv[1])',
    'print(wheel.read(next(name for name in wheel.namelist() if name.endswith(".dist-info/METADATA"))).decode())',
  ].join('\n');
  const metadata = execFileSync('python3', ['-c', printMetadata, wheel], { encoding: 'utf-8' });

  assert.match(metadata, /^Version: 2\.0\.0\.dev3$/m);
  assert.match(metadata, /^Project-URL: Source, https:\/\/github\.com\/u\/r\.git$/m);
  assert.doesNotMatch(metadata, /^License/m);
});
