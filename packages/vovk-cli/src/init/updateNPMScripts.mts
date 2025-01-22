import NPMCliPackageJson from '@npmcli/package-json';

export function getDevScript(pkgJson: NPMCliPackageJson, updateScriptsMode: 'implicit' | 'explicit') {
  const nextDev = pkgJson.content.scripts?.dev ?? 'next dev';
  const nextDevFlags = nextDev.replace('next dev', '').trim();
  return updateScriptsMode === 'explicit'
    ? `PORT=3000 concurrently '${nextDev}' 'vovk dev' --kill-others`
    : `vovk dev --next-dev${nextDevFlags ? ` -- ${nextDevFlags}` : ''}`;
}

export default async function updateNPMScripts(
  pkgJson: NPMCliPackageJson,
  root: string,
  updateScriptsMode: 'implicit' | 'explicit'
) {
  pkgJson.update({
    scripts: {
      ...pkgJson.content.scripts,
      generate: 'vovk generate',
      dev: getDevScript(pkgJson, updateScriptsMode),
    },
  });

  await pkgJson.save();
}
