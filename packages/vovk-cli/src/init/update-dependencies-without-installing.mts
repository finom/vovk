import fs from 'node:fs/promises';
import path from 'node:path';
import chalk from 'chalk';
import type { PackageJson } from 'type-fest';
import type { InitOptions } from '../types.mjs';
import type { getLogger } from '../utils/get-logger.mjs';
import { getNPMPackageMetadata } from '../utils/get-npm-package-metadata.mjs';

/** Root of the monorepo packages directory (…/packages) resolved from the compiled CLI location (dist/init/). */
const packagesRoot = path.resolve(import.meta.dirname, '../../..');

/** Vovk package names that have a matching local directory under packages/. */
const localPackageDirs: Record<string, string> = {
  vovk: 'vovk',
  'vovk-cli': 'vovk-cli',
  'vovk-ajv': 'vovk-ajv',
  'vovk-python': 'vovk-python',
  'vovk-rust': 'vovk-rust',
};

// the oldest versions vovk works with; a range the project already has stays when it lets in nothing older
const VERSION_FLOORS: Record<string, { floor: string; hint?: string }> = {
  zod: { floor: '4.2', hint: "zod 3 code can import 'zod/v3'" },
  valibot: { floor: '1.2' },
  '@valibot/to-json-schema': { floor: '1.5' },
  arktype: { floor: '2.1.28' },
};

const compareVersions = (a: number[], b: number[]) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

// [3, 25, 76] for "^3.25.76"; null for what isn't a semver range, such as a dist-tag, a URL or workspace:*
function getLowestVersion(range: string) {
  let lowest: number[] | null = null;
  for (const alternative of range.split('||')) {
    const [comparator = ''] = alternative
      .trim()
      .replace(/^([<>=~^]+)\s+/, '$1')
      .split(/\s+/);
    if (/^([*xX]|<.*)?$/.test(comparator)) return [0, 0, 0];
    const match = comparator.match(/^(?:[~^=]|>=?)?v?(\d+)(?:\.(\d+|[*xX]))?(?:\.(\d+|[*xX]))?/);
    if (!match) return null;
    const version = match.slice(1).map((part) => Number(part) || 0);
    if (!lowest || compareVersions(version, lowest) < 0) lowest = version;
  }
  return lowest;
}

function meetsFloor(range: string, floor: string) {
  const lowest = getLowestVersion(range);
  // a range that can't be read is the project's choice
  return !lowest || compareVersions(lowest, getLowestVersion(floor) ?? [0, 0, 0]) >= 0;
}

type DependencyUpdate = {
  packageName: string;
  name: string;
  status: 'added' | 'kept' | 'replaced';
  range: string;
  previousRange?: string;
  reason?: string;
};

async function getWantedRange({
  name,
  version,
  channel,
  log,
  dir,
}: {
  name: string;
  version: string | undefined;
  channel: InitOptions['channel'];
  log: ReturnType<typeof getLogger>;
  dir: string;
}) {
  // In test mode, use file: paths for local vovk packages
  if (process.env.NODE_ENV === 'test' && name in localPackageDirs) {
    const rel = path.relative(dir, path.join(packagesRoot, localPackageDirs[name]));
    return { range: `file:${rel}`, reason: 'the packages of this repository' };
  }

  if (version) {
    return { range: version, reason: 'the version vovk init sets up' };
  }
  const metadata = await getNPMPackageMetadata(name);
  const isVovk = name.startsWith('vovk');
  const tag = isVovk ? (channel ?? 'latest') : 'latest';
  const channelVersion = metadata['dist-tags'][tag];
  // not every package is published to every channel, vovk-ajv has no beta
  const publishedVersion = channelVersion ?? metadata['dist-tags'].latest;

  if (!publishedVersion) {
    throw new Error(`Package ${name} has no "${tag}" or "latest" version`);
  }

  if (!channelVersion) {
    log.info(`Package ${name} has no "${tag}" version, using the latest one, ${publishedVersion}`);
  }

  const floor = VERSION_FLOORS[name];
  return {
    range: `^${publishedVersion}`,
    reason: floor ? `vovk needs ${floor.floor}+${floor.hint ? `; ${floor.hint}` : ''}` : `the "${tag}" channel`,
  };
}

async function updateDeps({
  packageJson,
  packageNames,
  channel,
  key,
  log,
  dir,
}: {
  packageNames: string[];
  packageJson: PackageJson;
  channel: InitOptions['channel'];
  key: 'dependencies' | 'devDependencies';
  log: ReturnType<typeof getLogger>;
  dir: string;
}) {
  return Promise.all(
    packageNames.map(async (packageName): Promise<DependencyUpdate> => {
      let name: string;
      let version: string | undefined;

      if (packageName.startsWith('@')) {
        const lastAtIndex = packageName.lastIndexOf('@');
        if (lastAtIndex > 0) {
          name = packageName.substring(0, lastAtIndex);
          version = packageName.substring(lastAtIndex + 1);
        } else {
          name = packageName;
          version = undefined;
        }
      } else {
        const parts = packageName.split('@');
        name = parts[0];
        version = parts[1];
      }

      const previousRange = packageJson[key]?.[name];
      // vovk's own packages and a pinned version follow init; any other package keeps a range that is new enough
      const isSetUpByInit = name in localPackageDirs || !!version;
      const floor = VERSION_FLOORS[name]?.floor;
      if (previousRange && !isSetUpByInit && (!floor || meetsFloor(previousRange, floor))) {
        return { packageName, name, status: 'kept', range: previousRange };
      }

      const { range, reason } = await getWantedRange({ name, version, channel, log, dir });
      packageJson[key] ??= {};
      packageJson[key][name] = range;

      if (!previousRange) return { packageName, name, status: 'added', range };
      if (previousRange === range) return { packageName, name, status: 'kept', range };
      return { packageName, name, status: 'replaced', range, previousRange, reason };
    })
  );
}

export async function updateDependenciesWithoutInstalling({
  log,
  dir,
  dependencyNames,
  devDependencyNames,
  channel,
}: {
  log: ReturnType<typeof getLogger>;
  dir: string;
  dependencyNames: string[];
  devDependencyNames: string[];
  channel: InitOptions['channel'];
}) {
  const packageJsonPath = path.join(dir, 'package.json');
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8')) as PackageJson;
  const updates = {
    dependencies: await updateDeps({
      packageJson,
      packageNames: dependencyNames,
      channel,
      log,
      key: 'dependencies',
      dir,
    }),
    devDependencies: await updateDeps({
      packageJson,
      packageNames: devDependencyNames,
      channel,
      log,
      key: 'devDependencies',
      dir,
    }),
  };
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

  for (const [key, keyUpdates] of Object.entries(updates)) {
    const added = keyUpdates.filter(({ status }) => status === 'added');
    if (!added.length) continue;
    log.info(`Added ${key} to package.json:`);
    for (const { packageName } of added) {
      log.raw.info(` - ${chalk.cyan(packageName)}`);
    }
  }

  for (const { name, status, range, previousRange, reason } of [...updates.dependencies, ...updates.devDependencies]) {
    if (status === 'kept') log.info(`Kept ${name} ${range} from package.json`);
    if (status === 'replaced') log.warn(`Changed ${name} ${previousRange} → ${range} in package.json (${reason})`);
  }
}
