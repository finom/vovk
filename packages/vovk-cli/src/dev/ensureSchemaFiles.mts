import fs from 'node:fs/promises';
import path from 'node:path';
import debounce from 'lodash/debounce.js';
import { VovkSchemaIdEnum } from 'vovk';
import writeOneSegmentSchemaFile, { META_FILE_NAME, ROOT_SEGMENT_FILE_NAME } from './writeOneSegmentSchemaFile.mjs';
import { ProjectInfo } from '../getProjectInfo/index.mjs';
import formatLoggedSegmentName from '../utils/formatLoggedSegmentName.mjs';
import writeMetaJson from './writeMetaJson.mjs';

/**
 * Ensure that the schema files are created to avoid any import errors.
 */
export default async function ensureSchemaFiles(
  projectInfo: ProjectInfo | null,
  schemaOutAbsolutePath: string,
  segmentNames: string[]
): Promise<void> {
  const now = Date.now();
  let hasChanged = false;
  await fs.mkdir(schemaOutAbsolutePath, { recursive: true });
  await writeMetaJson(schemaOutAbsolutePath, projectInfo);

  // Create JSON files (if not exist) with name [segmentName].json (where segmentName can include /, which means the folder structure can be nested)
  await Promise.all(
    segmentNames.map(async (segmentName) => {
      const { isCreated } = await writeOneSegmentSchemaFile({
        schemaOutAbsolutePath,
        segmentSchema: {
          $schema: VovkSchemaIdEnum.SEGMENT,
          emitSchema: false,
          segmentName,
          segmentType: 'segment',
          controllers: {},
        },
        skipIfExists: true,
      });

      if (isCreated) {
        projectInfo?.log.debug(`Created empty schema file for ${formatLoggedSegmentName(segmentName)}`);
        hasChanged = true;
      }
    })
  );

  // Recursive function to delete unnecessary JSON files and folders
  async function deleteUnnecessaryJsonFiles(
    dirPath: string,
    allow: string[] = [`${META_FILE_NAME}.json`]
  ): Promise<void> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    await Promise.all(
      entries.map(async (entry) => {
        const absolutePath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          // Recursively delete unnecessary files and folders within nested directories
          await deleteUnnecessaryJsonFiles(absolutePath);

          // Check if the directory is empty after deletion and remove it if so
          const remainingEntries = await fs.readdir(absolutePath);
          if (remainingEntries.length === 0) {
            await fs.rmdir(absolutePath);
            projectInfo?.log.debug(`Deleted unnecessary schema directory "${absolutePath}"`);
            hasChanged = true;
          }
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
          const relativePath = path.relative(schemaOutAbsolutePath, absolutePath);
          const segmentName = relativePath.replace(/\\/g, '/').slice(0, -5); // Remove '.json' extension

          if (
            !segmentNames.includes(segmentName) &&
            !segmentNames.includes(segmentName.replace(ROOT_SEGMENT_FILE_NAME, '')) &&
            !allow.includes(entry.name)
          ) {
            await fs.unlink(absolutePath);
            projectInfo?.log.debug(`Deleted unnecessary schema file for ${formatLoggedSegmentName(segmentName)}`);
            hasChanged = true;
          }
        }
      })
    );
  }

  await deleteUnnecessaryJsonFiles(schemaOutAbsolutePath);

  if (hasChanged) projectInfo?.log.info(`Created empty schema files in ${Date.now() - now}ms`);
}

export const debouncedEnsureSchemaFiles = debounce(ensureSchemaFiles, 1000);
