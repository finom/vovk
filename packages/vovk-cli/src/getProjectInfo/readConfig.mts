import type { VovkConfig } from '../types.mjs';
import getConfigPath from './getConfigPath.mjs';

async function readConfig(): Promise<VovkConfig> {
  const configPath = await getConfigPath();
  let config: VovkConfig = {};

  if (!configPath) {
    return config;
  }

  try {
    const cacheBuster = Date.now();
    ({ default: config } = (await import(`${configPath}?cache=${cacheBuster}`)) as { default: VovkConfig });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('🐺 ❌ Error reading config file:', (e as Error).message);
  }

  return config;
}

export default readConfig;
