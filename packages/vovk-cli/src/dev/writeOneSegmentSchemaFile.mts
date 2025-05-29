import path from 'node:path';
import fs from 'node:fs/promises';
import type { VovkSegmentSchema } from 'vovk';
import diffSegmentSchema, { type DiffResult } from './diffSegmentSchema.mjs';
import getFileSystemEntryType from '../utils/getFileSystemEntryType.mjs';

export const ROOT_SEGMENT_FILE_NAME = 'root';
export const META_FILE_NAME = '_meta';

export default async function writeOneSegmentSchemaFile({
  schemaOutAbsolutePath,
  segmentSchema,
  skipIfExists = false,
}: {
  schemaOutAbsolutePath: string;
  segmentSchema: VovkSegmentSchema;
  skipIfExists?: boolean;
}): Promise<{
  isCreated: boolean;
  diffResult: DiffResult | null;
}> {
  const segmentPath = path.join(schemaOutAbsolutePath, `${segmentSchema.segmentName || ROOT_SEGMENT_FILE_NAME}.json`);

  if (skipIfExists && (await getFileSystemEntryType(segmentPath))) {
    try {
      await fs.stat(segmentPath);
      return { isCreated: false, diffResult: null };
    } catch {
      // File doesn't exist
    }
  }

  await fs.mkdir(path.dirname(segmentPath), { recursive: true });
  const schemaStr = JSON.stringify(segmentSchema, null, 2);
  const existing = await fs.readFile(segmentPath, 'utf-8').catch(() => null);
  if (existing === schemaStr) {
    return { isCreated: false, diffResult: null };
  }
  await fs.writeFile(segmentPath, schemaStr);

  if (existing) {
    return {
      isCreated: false,
      diffResult: diffSegmentSchema(JSON.parse(existing) as VovkSegmentSchema, segmentSchema),
    };
  }

  return { isCreated: true, diffResult: null };
}
