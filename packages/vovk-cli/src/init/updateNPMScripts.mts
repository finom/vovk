import NPMCliPackageJson from '@npmcli/package-json';

export function getDevScript(pkgJson: NPMCliPackageJson, updateScriptsMode: 'implicit' | 'explicit') {
  const dev = pkgJson.content.scripts?.dev ?? 'next dev';
  if (dev.includes('vovk dev')) {
    return dev; // Already has vovk dev
  }
  const nextDevFlags = dev.replace('next dev', '').trim();
  return updateScriptsMode === 'explicit'
    ? `PORT=3000 concurrently '${dev}' 'vovk dev' --kill-others`
    : `vovk dev --next-dev${nextDevFlags ? ` -- ${nextDevFlags}` : ''}`;
}

export async function updateNPMScripts(
  pkgJson: NPMCliPackageJson,
  root: string,
  updateScriptsMode: 'implicit' | 'explicit'
) {
  pkgJson.update({
    scripts: {
      ...pkgJson.content.scripts,
      dev: getDevScript(pkgJson, updateScriptsMode),
      prebuild: 'vovk generate',
    },
  });

  await pkgJson.save();
}
