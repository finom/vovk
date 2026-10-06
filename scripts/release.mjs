// `PACKAGE=<name> npm run <type>` releases one package: checks, quick gates, a version bump commit pushed to main,
// then the `<name>-v<version>` tag, whose push runs .github/workflows/publish.yml.
// `npm run <type> -- --dry-run` (or DRY_RUN=1) runs the checks and the gates, and prints the rest.
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PACKAGES = ['vovk', 'vovk-ajv', 'vovk-python', 'vovk-rust', 'vovk-cli'];
const TYPES = {
  patch: ['patch'],
  minor: ['minor'],
  major: ['major'],
  beta: ['prerelease', '--preid', 'beta'],
  'beta-minor': ['preminor', '--preid', 'beta'],
  'beta-major': ['premajor', '--preid', 'beta'],
};

const type = process.argv[2];
const { PACKAGE: name, DRY_RUN, npm_config_dry_run } = process.env;
// `npm run patch --dry-run` gives the flag to npm, which passes it on as npm_config_dry_run
const dryRun = process.argv.includes('--dry-run') || DRY_RUN === '1' || npm_config_dry_run === 'true';

const fail = (message) => {
  console.error(`release: ${message}`);
  process.exit(1);
};
if (!Object.hasOwn(TYPES, type) || !PACKAGES.includes(name)) {
  fail(`usage: PACKAGE=<${PACKAGES.join('|')}> npm run <${Object.keys(TYPES).join('|')}> [-- --dry-run]`);
}

process.chdir(fileURLToPath(new URL('..', import.meta.url)));
const run = (command, args, options) => execFileSync(command, args, { stdio: 'inherit', ...options });
const read = (command, args) => execFileSync(command, args, { encoding: 'utf8', stdio: 'pipe' }).trim();
const attempt = (command, args) => {
  try {
    return read(command, args);
  } catch {
    return '';
  }
};
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const writeJson = (path, data) => writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
const status = () => read('git', ['status', '--porcelain', '--untracked-files=all']);

if (status()) fail('the tree is not clean; the release makes its own commit');
const branch = read('git', ['branch', '--show-current']);
if (branch !== 'main') fail(`on ${branch || 'a detached HEAD'}; releases go from main`);
run('git', ['fetch', '--quiet', 'origin', 'main']);
const behind = read('git', ['rev-list', '--count', 'HEAD..FETCH_HEAD']);
if (behind !== '0') fail(`main is ${behind} commit(s) behind origin; pull first`);
const ahead = read('git', ['rev-list', '--count', 'FETCH_HEAD..HEAD']);

const last = attempt('git', ['describe', '--tags', '--abbrev=0', '--match', `${name}-v*`, 'HEAD']);
if (last && !read('git', ['diff', '--name-only', last, 'HEAD', '--', `packages/${name}`])) {
  fail(`packages/${name} is unchanged since ${last}`);
}

// npm computes the next version on a copy, so a dry run leaves the tree alone
const manifestPath = `packages/${name}/package.json`;
const current = readJson(manifestPath).version;
const scratch = mkdtempSync(join(tmpdir(), 'vovk-release-'));
copyFileSync(manifestPath, join(scratch, 'package.json'));
execFileSync('npm', ['version', ...TYPES[type], '--no-git-tag-version'], { cwd: scratch, stdio: 'ignore' });
const version = readJson(join(scratch, 'package.json')).version;
rmSync(scratch, { recursive: true });

const tag = `${name}-v${version}`;
if (attempt('git', ['tag', '--list', tag]) || attempt('git', ['ls-remote', '--tags', 'origin', `refs/tags/${tag}`])) {
  fail(`the tag ${tag} exists`);
}
if (attempt('npm', ['view', `${name}@${version}`, 'version'])) fail(`npm already has ${name}@${version}`);
// publish.yml's rule: a prerelease goes to the dist-tag its id names (4.0.0-beta.1 → beta), a release to latest
const distTag = version.includes('-') ? version.slice(version.indexOf('-') + 1).split('.')[0] : 'latest';

// The apps (docs, examples, perf) run the packages from this repo. A range that misses the new version fails `npm ci`,
// so the release moves it, in the lockfile too. The published packages' ranges stay as they are.
const moveRanges = (save) => {
  const lock = readJson('package-lock.json');
  lock.packages[`packages/${name}`].version = version;
  const apps = [];
  for (const [path, entry] of Object.entries(lock.packages)) {
    if (!path || path.startsWith('packages/') || path.includes('node_modules')) continue;
    const manifest = readJson(`${path}/package.json`);
    const fields = ['dependencies', 'devDependencies'].filter((field) => manifest[field]?.[name]);
    for (const field of fields) {
      manifest[field][name] = `^${version}`;
      entry[field][name] = `^${version}`;
    }
    if (!fields.length) continue;
    apps.push(path);
    if (save) writeJson(`${path}/package.json`, manifest);
  }
  if (save) writeJson('package-lock.json', lock);
  return apps;
};
const apps = moveRanges(false);

const since = last ? `changed since ${last}` : 'no earlier tag';
console.log(`\n${name} ${current} → ${version}, npm dist-tag ${distTag}; ${since}\n`);
run('npm', ['run', 'build']);
run('npm', ['run', 'lint']);
run('npx', ['turbo', 'run', 'tsc', '--dangerously-disable-package-manager-check']);
if (status()) fail(`the gates changed the tree:\n${status()}`);

const commit = `chore(release): ${name} ${version}`;
if (dryRun) {
  console.log(`
Dry run. The release would:
- run npm version ${TYPES[type].join(' ')} in packages/${name}: ${current} → ${version}
- set ${name} ^${version} in ${[...apps, 'package-lock.json'].join(', ')}
- commit "${commit}" and push main${ahead !== '0' ? `, with ${ahead} local commit(s) not on origin yet` : ''}
- push the tag ${tag}; its publish.yml run publishes ${name}@${version} to "${distTag}" once main.yml passes`);
  process.exit(0);
}

run('npm', ['version', ...TYPES[type], '--no-git-tag-version', '--prefix', `packages/${name}`]);
const bumped = readJson(manifestPath).version;
if (bumped !== version) fail(`npm version gave ${bumped}, not ${version}`);
moveRanges(true);
run('git', ['add', '--', manifestPath, 'package-lock.json', ...apps.map((app) => `${app}/package.json`)]);
const stray = status()
  .split('\n')
  .filter((line) => !line.startsWith('M  '));
if (stray.length) fail(`unexpected changes, nothing committed:\n${stray.join('\n')}`);
run('git', ['commit', '--quiet', '-m', commit]);
run('git', ['push', 'origin', 'main']);
run('git', ['tag', tag]);
run('git', ['push', 'origin', tag]);
console.log(`\nPushed ${tag}: publish.yml publishes ${name}@${version} once main.yml passes on the release commit.`);
