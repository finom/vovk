import fs from 'node:fs/promises';
import path from 'node:path';
import debounce from 'lodash/debounce.js';
import writeOneSchemaFile, { JSON_DIR_NAME, ROOT_SEGMENT_SCHEMA_NAME } from './writeOneSchemaFile.mjs';
import { ProjectInfo } from '../getProjectInfo/index.mjs';
import formatLoggedSegmentName from '../utils/formatLoggedSegmentName.mjs';

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
  const schemaJsonOutAbsolutePath = path.join(schemaOutAbsolutePath, JSON_DIR_NAME);
  const jsContent = `// auto-generated ${new Date().toISOString()}
${segmentNames
  .map((segmentName) => {
    return `module.exports['${segmentName}'] = require('./${JSON_DIR_NAME}/${segmentName || ROOT_SEGMENT_SCHEMA_NAME}.json');`;
  })
  .join('\n')}`;

  const dTsContent = `// auto-generated ${new Date().toISOString()}
import type { VovkSchema } from 'vovk';
declare const fullSchema: {
${segmentNames.map((segmentName) => `  '${segmentName}': VovkSchema;`).join('\n')}
};
export default fullSchema;`;

  const tsContent = `// auto-generated ${new Date().toISOString()}
import type { VovkSchema } from 'vovk';
${segmentNames.map((segmentName, i) => `import segment${i} from './${JSON_DIR_NAME}/${segmentName || ROOT_SEGMENT_SCHEMA_NAME}.json';`).join('\n')}
const fullSchema = {
${segmentNames.map((segmentName, i) => `  '${segmentName}': segment${i} as VovkSchema,`).join('\n')}
};
export default fullSchema;`;

  const jsAbsolutePath = path.join(schemaOutAbsolutePath, 'main.cjs');
  const dTsAbsolutePath = path.join(schemaOutAbsolutePath, 'main.d.cts');
  const tsAbsolutePath = path.join(schemaOutAbsolutePath, 'index.ts');

  const existingJs = await fs.readFile(jsAbsolutePath, 'utf-8').catch(() => null);
  const existingDTs = await fs.readFile(dTsAbsolutePath, 'utf-8').catch(() => null);
  const existingTs = await fs.readFile(tsAbsolutePath, 'utf-8').catch(() => null);

  await fs.mkdir(schemaJsonOutAbsolutePath, { recursive: true });
  // Create JSON files (if not exist) with name [segmentName].json (where segmentName can include /, which means the folder structure can be nested)
  await Promise.all(
    segmentNames.map(async (segmentName) => {
      const { isCreated } = await writeOneSchemaFile({
        schemaOutAbsolutePath,
        schema: {
          emitSchema: false,
          segmentName,
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

  // ignore 1st lines at the files
  if (existingJs?.split('\n').slice(1).join('\n') !== jsContent.split('\n').slice(1).join('\n')) {
    await fs.writeFile(jsAbsolutePath, jsContent);
  }
  if (existingDTs?.split('\n').slice(1).join('\n') !== dTsContent.split('\n').slice(1).join('\n')) {
    await fs.writeFile(dTsAbsolutePath, dTsContent);
  }
  if (existingTs?.split('\n').slice(1).join('\n') !== tsContent.split('\n').slice(1).join('\n')) {
    await fs.writeFile(tsAbsolutePath, tsContent);
  }

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
  await deleteUnnecessaryJsonFiles(schemaJsonOutAbsolutePath);

  if (hasChanged) projectInfo?.log.info(`Created empty schema files in ${Date.now() - now}ms`);
}

export const debouncedEnsureSchemaFiles = debounce(ensureSchemaFiles, 1000);
