const fs = require('fs/promises');
const path = require('path');

async function findConfigPath() {
  const rootDir = process.cwd();
  const baseName = 'vovk.config';
  const extensions = ['cjs', 'mjs', 'js'];

  for (let ext of extensions) {
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

/** @type {Promise<import('../../src').VovkConfig>} */
async function getConfig() {
  const configPath = await findConfigPath();
  /** @type {import('../../src').VovkConfig} */
  let config = {};

  if (!configPath) {
    return config;
  }

  if (configPath.endsWith('.cjs') || configPath.endsWith('.js')) {
    try {
      delete require.cache[require.resolve(configPath)];
    } catch {
      // noop
    }
    config = require(configPath);
  } else if (configPath.endsWith('.mjs')) {
    const cacheBuster = Date.now();
    ({ default: config } = await import(`${configPath}?cache=${cacheBuster}`));
  }

  return config;
}

module.exports = getConfig;
