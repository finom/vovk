import type { VovkSchema } from 'vovk';
import { SchemaIdEnum } from '../enums.mjs';

export default function pickSegmentFullSchema(schema: VovkSchema, segmentNames: string[]): VovkSchema {
  return {
    $schema: SchemaIdEnum.FULL,
    config: schema.config,
    segments: {
      ...Object.fromEntries(segmentNames.map((segmentName) => [segmentName, schema.segments[segmentName]])),
    },
  };
}

export function omitSegmentFullSchema(schema: VovkSchema, segmentNames: string[]): VovkSchema {
  return {
    $schema: SchemaIdEnum.FULL,
    config: schema.config,
    segments: Object.fromEntries(
      Object.entries(schema.segments).filter(([segmentName]) => !segmentNames.includes(segmentName))
    ),
  };
}
