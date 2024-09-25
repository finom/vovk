/*

class UpdateNpmScriptsAction extends Action {
  constructor(
    context: Init,
    private updateScriptsMode: 'implicit' | 'explicit'
  ) {
    super(context);
  }

  action = async () => {
    const pkgJson = await NPMCliPackageJson.load(this.context.root);

    pkgJson.update({
      scripts: {
        generate: 'vovk generate',
        dev:
          this.updateScriptsMode === 'explicit'
            ? 'PORT=3000 concurrently "vovk dev" "next dev" --kill-others'
            : 'vovk dev --next-dev',
      },
    });

    await pkgJson.save();
  };
}
  */

import NPMCliPackageJson from '@npmcli/package-json';

export default async function updateNPMScripts(root: string, updateScriptsMode: 'implicit' | 'explicit') {
  const pkgJson = await NPMCliPackageJson.load(root);

  pkgJson.update({
    scripts: {
      generate: 'vovk generate',
      dev:
        updateScriptsMode === 'explicit'
          ? 'PORT=3000 concurrently "vovk dev" "next dev" --kill-others'
          : 'vovk dev --next-dev',
    },
  });

  await pkgJson.save();
}
