import fs from 'fs/promises';
import path from 'path';
import debounce from 'lodash/debounce';
import writeOneMetadataFile, { ROOT_SEGMENT_SCHEMA_NAME } from './writeOneMetadataFile';
import { ProjectInfo } from '../getProjectInfo';

export default async function ensureMetadataFiles(
  metadataOutFullPath: string,
  segmentNames: string[],
  projectInfo: ProjectInfo | null
): Promise<void> {
  const now = Date.now();
  let hasChanged = false;
  // Create index.js file
  const indexContent = segmentNames
    .map((segmentName) => {
      return `module.exports['${segmentName || ROOT_SEGMENT_SCHEMA_NAME}'] = require('./${segmentName || ROOT_SEGMENT_SCHEMA_NAME}.json');`;
    })
    .join('\n');

  await fs.mkdir(metadataOutFullPath, { recursive: true });
  await fs.writeFile(path.join(metadataOutFullPath, 'index.js'), indexContent);

  // Create JSON files (if not exist) with name [segmentName].json (where segmentName can include /, which means the folder structure can be nested) : {} (empty object)
  await Promise.all(
    segmentNames.map(async (segmentName) => {
      const { isCreated } = await writeOneMetadataFile({
        metadataOutFullPath,
        segmentName,
        metadata: {
          segmentName,
          controllers: {},
          workers: {},
        },
        skipIfExists: true,
      });

      if (isCreated) {
        projectInfo?.log.debug(`Created empty metadata file for segment "${segmentName}"`);
        hasChanged = true;
      }
    })
  );

  // Recursive function to delete unnecessary JSON files and folders
  async function deleteUnnecessaryJsonFiles(dirPath: string): Promise<void> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          // Recursively delete unnecessary files and folders within nested directories
          await deleteUnnecessaryJsonFiles(fullPath);

          // Check if the directory is empty after deletion and remove it if so
          const remainingEntries = await fs.readdir(fullPath);
          if (remainingEntries.length === 0) {
            await fs.rmdir(fullPath);
            projectInfo?.log.debug(`Deleted unnecessary metadata directory "${fullPath}"`);
            hasChanged = true;
          }
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
          const relativePath = path.relative(metadataOutFullPath, fullPath);
          const segmentName = relativePath.replace(/\\/g, '/').slice(0, -5); // Remove '.json' extension

          if (
            !segmentNames.includes(segmentName) &&
            !segmentNames.includes(segmentName.replace(ROOT_SEGMENT_SCHEMA_NAME, ''))
          ) {
            await fs.unlink(fullPath);
            projectInfo?.log.debug(`Deleted unnecessary metadata file for segment "${segmentName}"`);
            hasChanged = true;
          }
        }
      })
    );
  }

  // Start the recursive deletion from the root directory
  await deleteUnnecessaryJsonFiles(metadataOutFullPath);

  if (hasChanged) projectInfo?.log.info(`Metadata files updated in ${Date.now() - now}ms`);
}

export const debouncedEnsureMetadataFiles = debounce(ensureMetadataFiles, 1000);
