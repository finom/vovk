import { promises as fs } from 'fs';
import path from 'path';
import type { VovkConfig } from '../types.mjs';

async function findConfigPath(): Promise<string | null> {
  const rootDir = process.cwd();
  const baseName = 'vovk.config';
  const extensions = ['cjs', 'mjs', 'js'];

  for (const ext of extensions) {
    const filePath = path.join(rootDir, `${baseName}.${ext}`);
    try {
      await fs.stat(filePath);
      return filePath; // Return the path if the file exists
    } catch {
      // If the file doesn't exist, an error is thrown. Catch it and continue checking.
    }
  }

  return null; // Return null if no config file was found
}

async function readConfig(): Promise<VovkConfig> {
  const configPath = await findConfigPath();
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
