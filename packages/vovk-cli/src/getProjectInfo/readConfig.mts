import type { VovkConfig } from '../types.mjs';
import getConfigPaths from './getConfigPaths.mjs';

async function readConfig({ cwd }: { cwd: string }): Promise<{ userConfig: VovkConfig; configPaths: string[] }> {
  const configPaths = await getConfigPaths({ cwd });
  let userConfig: VovkConfig = {};

  if (!configPaths.length) {
    return { userConfig, configPaths };
  }

  const configPath = configPaths[0];

  try {
    const cacheBuster = Date.now();
    ({ default: userConfig } = (await import(`${configPath}?cache=${cacheBuster}`)) as { default: VovkConfig });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('🐺 ❌ Error reading config file:', (e as Error).message);
  }

  return { userConfig, configPaths };
}

export default readConfig;
