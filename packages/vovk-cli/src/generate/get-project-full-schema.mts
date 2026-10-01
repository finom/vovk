import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';
import type { VovkSchema } from 'vovk';
import { deepExtend, type VovkMetaSchema, VovkSchemaIdEnum, type VovkStrictConfig } from 'vovk/internal';
import { META_FILE_NAME, ROOT_SEGMENT_FILE_NAME } from '../dev/write-one-segment-schema-file.mjs';
import { getMetaSchema } from '../get-project-info/get-meta-schema.mjs';
import type { ProjectInfo } from '../get-project-info/index.mjs';

export async function getProjectFullSchema({
  schemaOutAbsolutePath,
  isNextInstalled,
  log,
  config,
}: {
  schemaOutAbsolutePath: string;
  isNextInstalled: boolean;
  log: ProjectInfo['log'];
  config: VovkStrictConfig;
}): Promise<VovkSchema> {
  const result: VovkSchema = {
    $schema: VovkSchemaIdEnum.SCHEMA,
    segments: {},
    meta: getMetaSchema({
      config,
    }),
  };

  const isEmptyLogOrWarn = isNextInstalled ? log.warn : log.debug;

  // Handle config.json
  const metaPath = path.join(schemaOutAbsolutePath, `${META_FILE_NAME}.json`);
  const metaContent = await readFile(metaPath, 'utf-8').catch(() => null);
  if (metaContent === null) {
    isEmptyLogOrWarn(`${META_FILE_NAME}.json not found at ${metaPath}. Using empty meta as fallback.`);
  } else {
    result.meta = deepExtend({} as VovkMetaSchema, result.meta, parseSchemaFile(metaPath, metaContent));
  }
  // Handle segments directory
  const segmentsDir = path.join(schemaOutAbsolutePath);
  try {
    await access(segmentsDir); // Check if directory exists
  } catch {
    isEmptyLogOrWarn(`Segments directory not found at ${segmentsDir}. Using empty segments as fallback.`);
    return result;
  }

  // the pattern stays relative: glob reads "\" and brackets in a path as pattern syntax
  const files = await glob('**/*.json', { cwd: segmentsDir, absolute: true });
  const filePaths = [];
  for await (const filePath of files) {
    if (path.basename(filePath) === `${META_FILE_NAME}.json`) continue; // Skip _meta.json
    filePaths.push(filePath);
  }

  // Process each JSON file
  for (const filePath of filePaths.toSorted()) {
    const jsonData = parseSchemaFile(filePath, await readFile(filePath, 'utf-8'));

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
  }

  return result;
}

// a merge conflict leaves a schema file unparseable, skipping it would quietly drop it from the client
function parseSchemaFile(filePath: string, content: string) {
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to parse schema file ${filePath}: ${(error as Error).message}`);
  }
}
