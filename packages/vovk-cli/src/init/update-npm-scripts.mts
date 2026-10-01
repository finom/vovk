import type NPMCliPackageJson from '@npmcli/package-json';
import { getNextDevPort } from '../dev/get-next-dev-port.mjs';

export function getDevScript(pkgJson: NPMCliPackageJson, updateScriptsMode: 'implicit' | 'explicit') {
  const dev = pkgJson.content.scripts?.dev ?? 'next dev';
  if (dev.includes('vovk dev')) {
    return dev; // Already has vovk dev
  }
  const nextDevFlags = dev.replace('next dev', '').trim();
  // vovk dev requests the schema on PORT, next dev listens on -p when it's given
  const port = getNextDevPort(nextDevFlags.split(/\s+/)) ?? '3000';
  return updateScriptsMode === 'explicit'
    ? `PORT=${port} concurrently '${dev}' 'vovk dev' --kill-others`
    : `vovk dev --next-dev${nextDevFlags ? ` -- ${nextDevFlags}` : ''}`;
}

// a script the project already has keeps running, the vovk command runs after it
function chainScript(script: string | undefined, command: string) {
  if (!script) return command;
  return script.includes(command) ? script : `${script} && ${command}`;
}

export async function updateNPMScripts({
  pkgJson,
  bundle,
  updateScriptsMode,
}: {
  pkgJson: NPMCliPackageJson;
  root: string;
  bundle?: boolean;
  updateScriptsMode: 'implicit' | 'explicit';
}) {
  const scripts = pkgJson.content.scripts;
  pkgJson.update({
    scripts: {
      ...scripts,
      dev: getDevScript(pkgJson, updateScriptsMode),
      prebuild: chainScript(scripts?.prebuild, 'vovk generate'),
      ...(bundle ? { bundle: chainScript(scripts?.bundle, 'vovk bundle') } : {}),
    },
  });

  await pkgJson.save();
}
