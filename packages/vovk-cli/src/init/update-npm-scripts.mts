import fs from 'node:fs';
import path from 'node:path';
import type NPMCliPackageJson from '@npmcli/package-json';
import { getNextDevPort } from '../dev/get-next-dev-port.mjs';

type UpdateScriptsMode = 'implicit' | 'explicit';

// vovk dev hands everything after -- to next dev, so the implicit script fits only `next dev [flags]`
export function getDevScriptMode(pkgJson: NPMCliPackageJson, updateScriptsMode: UpdateScriptsMode): UpdateScriptsMode {
  const dev = pkgJson.content.scripts?.dev ?? 'next dev';
  return dev.includes('vovk dev') || /^next dev(\s+[^&|;<>]*)?$/.test(dev.trim()) ? updateScriptsMode : 'explicit';
}

export function getDevScript(pkgJson: NPMCliPackageJson, updateScriptsMode: UpdateScriptsMode) {
  const dev = pkgJson.content.scripts?.dev ?? 'next dev';
  if (dev.includes('vovk dev')) {
    return dev; // Already has vovk dev
  }
  const nextDevFlags = dev.replace('next dev', '').trim();
  // vovk dev requests the schema on PORT, next dev listens on -p when it's given
  const port = getNextDevPort(nextDevFlags.split(/\s+/)) ?? '3000';
  // cross-env and double quotes, so cmd.exe runs it too
  return getDevScriptMode(pkgJson, updateScriptsMode) === 'explicit'
    ? `cross-env PORT=${port} concurrently "${dev.replace(/"/g, '\\"')}" "vovk dev" --kill-others`
    : `vovk dev --next-dev${nextDevFlags ? ` -- ${nextDevFlags}` : ''}`;
}

// Yarn 2+ runs no pre scripts, so there the build script runs vovk generate itself
export function isYarnBerry({
  pkgJson,
  root,
  userAgent,
}: {
  pkgJson: NPMCliPackageJson;
  root: string;
  userAgent?: string;
}) {
  // "yarn@4.9.2" in package.json, "yarn/4.9.2 npm/? node/v24.1.0 darwin arm64" in npm_config_user_agent
  const getYarnMajor = (spec?: string) => Number(spec?.match(/^yarn[@/](\d+)/)?.[1] ?? 0);
  const { packageManager } = pkgJson.content;
  if (packageManager) return getYarnMajor(packageManager) >= 2;
  return fs.existsSync(path.join(root, '.yarnrc.yml')) || getYarnMajor(userAgent) >= 2;
}

// a script the project already has keeps running, the vovk command runs after it
function chainScript(script: string | undefined, command: string) {
  if (!script) return command;
  return script.includes(command) ? script : `${script} && ${command}`;
}

export async function updateNPMScripts({
  pkgJson,
  root,
  bundle,
  updateScriptsMode,
  userAgent,
}: {
  pkgJson: NPMCliPackageJson;
  root: string;
  bundle?: boolean;
  updateScriptsMode: UpdateScriptsMode;
  userAgent?: string;
}) {
  const scripts = pkgJson.content.scripts;
  const build = scripts?.build ?? 'next build';
  pkgJson.update({
    scripts: {
      ...scripts,
      dev: getDevScript(pkgJson, updateScriptsMode),
      ...(isYarnBerry({ pkgJson, root, userAgent })
        ? { build: build.includes('vovk generate') ? build : `vovk generate && ${build}` }
        : { prebuild: chainScript(scripts?.prebuild, 'vovk generate') }),
      ...(bundle ? { bundle: chainScript(scripts?.bundle, 'vovk bundle') } : {}),
    },
  });

  await pkgJson.save();
}
