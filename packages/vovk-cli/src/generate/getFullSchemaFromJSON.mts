import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';
import { VovkSchemaIdEnum, type VovkSchema } from 'vovk';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';
import { ROOT_SEGMENT_SCHEMA_NAME } from '../dev/writeOneSegmentSchemaFile.mjs';

export async function getFullSchemaFromJSON(
  schemaOutAbsolutePath: string,
  log: ProjectInfo['log']
): Promise<VovkSchema> {
  const result: VovkSchema = {
    $schema: VovkSchemaIdEnum.SCHEMA,
    config: {},
    segments: {},
  };

  // Handle config.json
  const configPath = path.join(schemaOutAbsolutePath, 'config.json');
  try {
    const configContent = await readFile(configPath, 'utf-8');
    result.config = JSON.parse(configContent);
  } catch {
    log.warn(`Warning: config.json not found at ${configPath}. Using empty config as fallback.`);
    result.config = {};
  }

  // Handle segments directory
  const segmentsDir = path.join(schemaOutAbsolutePath, 'segments');
  try {
    await access(segmentsDir); // Check if directory exists

    // Use glob to get all JSON files recursively
    const files = await glob(`${segmentsDir}/**/*.json`);

    // Process each JSON file
    for await (const filePath of files.toSorted()) {
      try {
        const content = await readFile(filePath, 'utf-8');
        const jsonData = JSON.parse(content);

        // Get relative path from segments directory and convert to key
        let relativePath = path
          .relative(segmentsDir, filePath)
          .replace(/\.json$/, '') // Remove .json extension
          .replace(/\\/g, '/'); // Normalize to forward slashes

        // Special case for _root.json
        if (path.basename(filePath) === `${ROOT_SEGMENT_SCHEMA_NAME}.json` && path.dirname(filePath) === segmentsDir) {
          relativePath = '';
        }

        result.segments[relativePath] = jsonData;
      } catch (error) {
        log.warn(`Warning: Failed to process file ${filePath}: ${error}`);
      }
    }
  } catch {
    log.warn(`Warning: Segments directory not found at ${segmentsDir}. Using empty segments as fallback.`);
    result.segments = {};
  }

  return result;
}
