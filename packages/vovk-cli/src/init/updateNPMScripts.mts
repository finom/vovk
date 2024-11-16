import NPMCliPackageJson from '@npmcli/package-json';

export default async function updateNPMScripts(root: string, updateScriptsMode: 'implicit' | 'explicit') {
  const pkgJson = await NPMCliPackageJson.load(root);

  pkgJson.update({
    scripts: {
      ...pkgJson.content.scripts,
      generate: 'vovk generate',
      dev:
        updateScriptsMode === 'explicit'
          ? "PORT=3000 concurrently 'next dev' 'vovk dev' --kill-others"
          : 'vovk dev --next-dev',
    },
  });

  await pkgJson.save();
}
