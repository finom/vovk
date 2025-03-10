import { glob, readFile, access } from 'node:fs/promises';
import * as path from 'node:path';
import type { VovkFullSchema } from 'vovk';
import { ProjectInfo } from '../getProjectInfo/index.mjs';

export async function getFullSchemaFromJSON(
  schemaOutAbsolutePath: string,
  projectInfo: ProjectInfo
): Promise<VovkFullSchema> {
  const result: VovkFullSchema = {
    config: {},
    segments: {},
  };
  const { log } = projectInfo;

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
    for await (const filePath of files) {
      try {
        const content = await readFile(filePath, 'utf-8');
        const jsonData = JSON.parse(content);

        // Get relative path from segments directory and convert to key
        let relativePath = path
          .relative(segmentsDir, filePath)
          .replace(/\.json$/, '') // Remove .json extension
          .replace(/\\/g, '/'); // Normalize to forward slashes

        // Special case for _root.json
        if (path.basename(filePath) === '_root.json' && path.dirname(filePath) === segmentsDir) {
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

// Example usage:
/*
async function main() {
  try {
    const schema = await getSchemaFromJSON('/path/to/directory');
    console.log(schema);
  } catch (error) {
    console.error('Error:', error);
  }
}
main();
*/
