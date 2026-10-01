import fs from 'node:fs/promises';
import path from 'node:path';
import type { VovkSegmentSchema } from 'vovk/internal';
import { getFileSystemEntryType } from '../utils/get-file-system-entry-type.mjs';
import { type DiffResult, diffSegmentSchema } from './diff-segment-schema.mjs';

export const ROOT_SEGMENT_FILE_NAME = 'root';
export const META_FILE_NAME = '_meta';

export async function writeOneSegmentSchemaFile({
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

  // segmentName may come from an http response, keep the write inside the schema out dir
  const relativeToOut = path.relative(schemaOutAbsolutePath, segmentPath);
  if (relativeToOut.startsWith(`..${path.sep}`) || relativeToOut === '..' || path.isAbsolute(relativeToOut)) {
    throw new Error(
      `Refusing to write schema outside ${schemaOutAbsolutePath} for segment ${JSON.stringify(segmentSchema.segmentName)}`
    );
  }

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
  // parsed before the write, so a corrupt file can't fail the request after the new schema is written
  const existingControllers = existing ? parseControllers(existing) : null;
  await fs.writeFile(segmentPath, schemaStr);

  if (existingControllers) {
    return {
      isCreated: false,
      diffResult: diffSegmentSchema({ ...segmentSchema, controllers: existingControllers }, segmentSchema),
    };
  }

  return { isCreated: true, diffResult: null };
}

// a corrupt file counts as a schema without controllers
function parseControllers(json: string): VovkSegmentSchema['controllers'] {
  try {
    return (JSON.parse(json) as Partial<VovkSegmentSchema>).controllers ?? {};
  } catch {
    return {};
  }
}
