import type { VovkFullSchema } from 'vovk';
import { SchemaIdEnum } from '../enums.mjs';

export default function pickSegmentFullSchema(fullSchema: VovkFullSchema, segmentNames: string[]): VovkFullSchema {
  return {
    $schema: SchemaIdEnum.FULL,
    config: fullSchema.config,
    segments: {
      ...Object.fromEntries(segmentNames.map((segmentName) => [segmentName, fullSchema.segments[segmentName]])),
    },
  };
}

export function omitSegmentFullSchema(fullSchema: VovkFullSchema, segmentNames: string[]): VovkFullSchema {
  return {
    $schema: SchemaIdEnum.FULL,
    config: fullSchema.config,
    segments: Object.fromEntries(
      Object.entries(fullSchema.segments).filter(([segmentName]) => !segmentNames.includes(segmentName))
    ),
  };
}
