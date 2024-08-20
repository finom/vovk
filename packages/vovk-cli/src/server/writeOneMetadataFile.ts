import path from 'path';
import fs from 'fs/promises';
import { VovkMetadata } from 'vovk';
import diffMetadata, { DiffResult } from './diffMetadata';

export const ROOT_SEGMENT_SCHEMA_NAME = '_root';

export default async function writeOneMetadataFile({
  metadataOutFullPath,
  segmentName,
  metadata,
  skipIfExists = false,
}: {
  metadataOutFullPath: string;
  segmentName: string;
  metadata: VovkMetadata;
  skipIfExists?: boolean;
}): Promise<{
  isCreated: boolean;
  diffResult: DiffResult | null;
}> {
  const segmentPath = path.join(metadataOutFullPath, `${segmentName || ROOT_SEGMENT_SCHEMA_NAME}.json`);

  if (skipIfExists) {
    try {
      await fs.stat(segmentPath);
      return { isCreated: false, diffResult: null };
    } catch {
      // File doesn't exist
    }
  }

  await fs.mkdir(path.dirname(segmentPath), { recursive: true });
  const metadataStr = JSON.stringify(metadata, null, 2);
  const existing = await fs.readFile(segmentPath, 'utf-8').catch(() => null);
  if (existing === metadataStr) {
    return { isCreated: false, diffResult: null };
  }
  await fs.writeFile(segmentPath, metadataStr);

  if (existing) {
    return { isCreated: false, diffResult: diffMetadata(JSON.parse(existing), metadata) };
  }

  return { isCreated: true, diffResult: null };
}
