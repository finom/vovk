import NPMCliPackageJson from '@npmcli/package-json';

export default async function updateNPMScripts(root: string, updateScriptsMode: 'implicit' | 'explicit') {
  const pkgJson = await NPMCliPackageJson.load(root);
  const nextDev = pkgJson.content.scripts?.dev ?? 'next dev';
  const nextDevFlags = nextDev.replace('next dev', '').trim();

  pkgJson.update({
    scripts: {
      ...pkgJson.content.scripts,
      generate: 'vovk generate',
      dev:
        updateScriptsMode === 'explicit'
          ? `PORT=3000 concurrently '${nextDev}' 'vovk dev' --kill-others`
          : `vovk dev --next-dev${nextDevFlags ? ` -- ${nextDevFlags}` : ''}`,
    },
  });

  await pkgJson.save();
}
