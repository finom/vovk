import fs from 'fs/promises';
import path from 'path';
import debounce from 'lodash/debounce.js';
import writeOneSchemaFile, { ROOT_SEGMENT_SCHEMA_NAME } from './writeOneSchemaFile.mjs';
import { ProjectInfo } from '../getProjectInfo/index.mjs';
import formatLoggedSegmentName from '../utils/formatLoggedSegmentName.mjs';

export default async function ensureSchemaFiles(
  schemaOutFullPath: string,
  segmentNames: string[],
  projectInfo: ProjectInfo | null
): Promise<void> {
  const now = Date.now();
  let hasChanged = false;
  // Create index.js file
  const indexContent = segmentNames
    .map((segmentName) => {
      return `module.exports['${segmentName}'] = require('./${segmentName || ROOT_SEGMENT_SCHEMA_NAME}.json');`;
    })
    .join('\n');

  const dTsContent = `import type { VovkSchema } from 'vovk';
declare const segmentSchema: Record<string, VovkSchema>;
export default segmentSchema;`;

  await fs.mkdir(schemaOutFullPath, { recursive: true });
  await fs.writeFile(path.join(schemaOutFullPath, 'index.js'), indexContent);
  await fs.writeFile(path.join(schemaOutFullPath, 'index.d.ts'), dTsContent);

  // Create JSON files (if not exist) with name [segmentName].json (where segmentName can include /, which means the folder structure can be nested) : {} (empty object)
  await Promise.all(
    segmentNames.map(async (segmentName) => {
      const { isCreated } = await writeOneSchemaFile({
        schemaOutFullPath,
        schema: {
          emitSchema: false,
          segmentName,
          controllers: {},
          workers: {},
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
            projectInfo?.log.debug(`Deleted unnecessary schema directory "${fullPath}"`);
            hasChanged = true;
          }
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
          const relativePath = path.relative(schemaOutFullPath, fullPath);
          const segmentName = relativePath.replace(/\\/g, '/').slice(0, -5); // Remove '.json' extension

          if (
            !segmentNames.includes(segmentName) &&
            !segmentNames.includes(segmentName.replace(ROOT_SEGMENT_SCHEMA_NAME, ''))
          ) {
            await fs.unlink(fullPath);
            projectInfo?.log.debug(`Deleted unnecessary schema file for ${formatLoggedSegmentName(segmentName)}`);
            hasChanged = true;
          }
        }
      })
    );
  }

  // Start the recursive deletion from the root directory
  await deleteUnnecessaryJsonFiles(schemaOutFullPath);

  if (hasChanged) projectInfo?.log.info(`Schema files updated in ${Date.now() - now}ms`);
}

export const debouncedEnsureSchemaFiles = debounce(ensureSchemaFiles, 1000);
