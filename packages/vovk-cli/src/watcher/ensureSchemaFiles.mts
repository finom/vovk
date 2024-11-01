import fs from 'node:fs/promises';
import path from 'node:path';
import debounce from 'lodash/debounce.js';
import writeOneSchemaFile, { ROOT_SEGMENT_SCHEMA_NAME } from './writeOneSchemaFile.mjs';
import { ProjectInfo } from '../getProjectInfo/index.mjs';
import formatLoggedSegmentName from '../utils/formatLoggedSegmentName.mjs';

export default async function ensureSchemaFiles(
  projectInfo: ProjectInfo | null,
  schemaOutAbsolutePath: string,
  segmentNames: string[]
): Promise<void> {
  const now = Date.now();
  let hasChanged = false;
  // Create index.js file
  const indexContent = `// auto-generated
${segmentNames
  .map((segmentName) => {
    return `module.exports['${segmentName}'] = require('./${segmentName || ROOT_SEGMENT_SCHEMA_NAME}.json');`;
  })
  .join('\n')}`;

  const dTsContent = `// auto-generated
import type { VovkSchema } from 'vovk';
declare const segmentSchema: {
${segmentNames.map((segmentName) => `  '${segmentName}': VovkSchema;`).join('\n')}
};
export default segmentSchema;`;

  const jsAbsolutePath = path.join(schemaOutAbsolutePath, 'index.js');
  const dTsAbsolutePath = path.join(schemaOutAbsolutePath, 'index.d.ts');

  const existingJs = await fs.readFile(jsAbsolutePath, 'utf-8').catch(() => null);
  const existingDTs = await fs.readFile(dTsAbsolutePath, 'utf-8').catch(() => null);

  await fs.mkdir(schemaOutAbsolutePath, { recursive: true });
  if (existingJs !== indexContent) {
    await fs.writeFile(jsAbsolutePath, indexContent);
  }
  if (existingDTs !== dTsContent) {
    await fs.writeFile(dTsAbsolutePath, dTsContent);
  }

  // Create JSON files (if not exist) with name [segmentName].json (where segmentName can include /, which means the folder structure can be nested)
  await Promise.all(
    segmentNames.map(async (segmentName) => {
      const { isCreated } = await writeOneSchemaFile({
        schemaOutAbsolutePath,
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
            !segmentNames.includes(segmentName.replace(ROOT_SEGMENT_SCHEMA_NAME, ''))
          ) {
            await fs.unlink(absolutePath);
            projectInfo?.log.debug(`Deleted unnecessary schema file for ${formatLoggedSegmentName(segmentName)}`);
            hasChanged = true;
          }
        }
      })
    );
  }

  // Start the recursive deletion from the root directory
  await deleteUnnecessaryJsonFiles(schemaOutAbsolutePath);

  if (hasChanged) projectInfo?.log.info(`Schema files updated in ${Date.now() - now}ms`);
}

export const debouncedEnsureSchemaFiles = debounce(ensureSchemaFiles, 1000);
