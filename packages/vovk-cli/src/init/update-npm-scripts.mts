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
  pkgJson.update({
    scripts: {
      ...pkgJson.content.scripts,
      dev: getDevScript(pkgJson, updateScriptsMode),
      prebuild: 'vovk generate',
      ...(bundle ? { bundle: 'vovk bundle' } : {}),
    },
  });

  await pkgJson.save();
}
