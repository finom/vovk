import fs from 'node:fs/promises';
import path from 'node:path';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';
import { META_FILE_NAME } from './writeOneSegmentSchemaFile.mjs';
import chalkHighlightThing from '../utils/chalkHighlightThing.mjs';
import getMetaSchema from '../getProjectInfo/getMetaSchema.mjs';

export default async function writeMetaJson(schemaOutAbsolutePath: string, projectInfo: ProjectInfo) {
  const metaJsonPath = path.join(schemaOutAbsolutePath, META_FILE_NAME + '.json');
  const metaStr = JSON.stringify(
    getMetaSchema({
      config: projectInfo.config,
    }),
    null,
    2
  );

  const existingStr = await fs.readFile(metaJsonPath, 'utf-8').catch(() => null);

  if (existingStr !== metaStr) {
    await fs.writeFile(metaJsonPath, metaStr);
    projectInfo?.log.info(`Meta JSON is written to ${chalkHighlightThing(metaJsonPath)}`);
  } else {
    projectInfo?.log.debug(`Meta JSON is up to date at ${chalkHighlightThing(metaJsonPath)}`);
  }
}
