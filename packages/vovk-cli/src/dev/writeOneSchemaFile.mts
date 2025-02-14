import path from 'node:path';
import fs from 'node:fs/promises';
import type { VovkSchema } from 'vovk';
import diffSchema, { type DiffResult } from './diffSchema.mjs';
import getFileSystemEntryType from '../utils/getFileSystemEntryType.mjs';

export const ROOT_SEGMENT_SCHEMA_NAME = '_root';
export const JSON_DIR_NAME = 'json';

export default async function writeOneSchemaFile({
  schemaOutAbsolutePath,
  schema,
  skipIfExists = false,
}: {
  schemaOutAbsolutePath: string;
  schema: VovkSchema;
  skipIfExists?: boolean;
}): Promise<{
  isCreated: boolean;
  diffResult: DiffResult | null;
}> {
  const segmentPath = path.join(
    schemaOutAbsolutePath,
    JSON_DIR_NAME,
    `${schema.segmentName || ROOT_SEGMENT_SCHEMA_NAME}.json`
  );

  if (skipIfExists && (await getFileSystemEntryType(segmentPath))) {
    try {
      await fs.stat(segmentPath);
      return { isCreated: false, diffResult: null };
    } catch {
      // File doesn't exist
    }
  }

  await fs.mkdir(path.dirname(segmentPath), { recursive: true });
  const schemaStr = JSON.stringify(schema, null, 2);
  const existing = await fs.readFile(segmentPath, 'utf-8').catch(() => null);
  if (existing === schemaStr) {
    return { isCreated: false, diffResult: null };
  }
  await fs.writeFile(segmentPath, schemaStr);

  if (existing) {
    return { isCreated: false, diffResult: diffSchema(JSON.parse(existing) as VovkSchema, schema) };
  }

  return { isCreated: true, diffResult: null };
}
