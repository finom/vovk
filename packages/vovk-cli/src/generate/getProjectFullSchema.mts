import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';
import { VovkSchemaIdEnum, VovkStrictConfig, type VovkSchema } from 'vovk';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';
import { META_FILE_NAME, ROOT_SEGMENT_FILE_NAME } from '../dev/writeOneSegmentSchemaFile.mjs';
import getMetaSchema from '../getProjectInfo/getMetaSchema.mjs';
import { PackageJson } from 'type-fest';

export async function getProjectFullSchema({
  schemaOutAbsolutePath,
  isNextInstalled,
  log,
  package: packageJson,
  config,
}: {
  schemaOutAbsolutePath: string;
  isNextInstalled: boolean;
  log: ProjectInfo['log'];
  package: PackageJson;
  config: VovkStrictConfig;
}): Promise<VovkSchema> {
  const result: VovkSchema = {
    $schema: VovkSchemaIdEnum.SCHEMA,
    segments: {},
    meta: getMetaSchema({
      config,
      package: packageJson,
    }),
  };

  console.log('result', result)

  const isEmptyLogOrWarn = isNextInstalled ? log.warn : log.debug;

  // Handle config.json
  const metaPath = path.join(schemaOutAbsolutePath, `${META_FILE_NAME}.json`);
  try {
    const metaContent = await readFile(metaPath, 'utf-8');
    result.meta = JSON.parse(metaContent);
  } catch {
    isEmptyLogOrWarn(`${META_FILE_NAME}.json not found at ${metaPath}. Using empty meta as fallback.`);
  }

  // Handle segments directory
  const segmentsDir = path.join(schemaOutAbsolutePath);
  try {
    await access(segmentsDir); // Check if directory exists

    // Use glob to get all JSON files recursively
    const files = await glob(`${segmentsDir}/**/*.json`);
    const filePaths = [];
    for await (const filePath of files) {
      if (path.basename(filePath) === `${META_FILE_NAME}.json`) continue; // Skip _meta.json
      filePaths.push(filePath);
    }

    // Process each JSON file
    for (const filePath of filePaths.toSorted()) {
      try {
        const content = await readFile(filePath, 'utf-8');
        const jsonData = JSON.parse(content);

        // Get relative path from segments directory and convert to key
        let relativePath = path
          .relative(segmentsDir, filePath)
          .replace(/\.json$/, '') // Remove .json extension
          .replace(/\\/g, '/'); // Normalize to forward slashes

        // Special case for _root.json
        if (path.basename(filePath) === `${ROOT_SEGMENT_FILE_NAME}.json` && path.dirname(filePath) === segmentsDir) {
          relativePath = '';
        }

        result.segments[relativePath] = jsonData;
      } catch (error) {
        log.warn(`Failed to process file ${filePath}: ${error}`);
      }
    }
  } catch {
    isEmptyLogOrWarn(`Segments directory not found at ${segmentsDir}. Using empty segments as fallback.`);
    result.segments = {};
  }

  return result;
}
