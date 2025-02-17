import fs from 'node:fs/promises';
import path from 'node:path';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';
import pick from 'lodash/pick.js';

export default async function writeConfigJson(schemaOutAbsolutePath: string, projectInfo: ProjectInfo | null) {
  const configJsonPath = path.join(schemaOutAbsolutePath, 'config.json');
  const configStr = JSON.stringify(projectInfo ? pick(projectInfo.config, projectInfo.config.emitConfig) : {}, null, 2);

  const existingStr = await fs.readFile(configJsonPath, 'utf-8').catch(() => null);

  if (existingStr !== configStr) {
    await fs.writeFile(configJsonPath, configStr);
    projectInfo?.log.info(`config.json written to ${configJsonPath}`);
  } else {
    projectInfo?.log.debug(`config.json is up to date at ${configJsonPath}`);
  }
}
