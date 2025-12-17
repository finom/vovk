import { VovkSchemaIdEnum, type VovkSchema } from 'vovk';

export function pickSegmentFullSchema(schema: VovkSchema, segmentNames: string[]): VovkSchema {
  return {
    $schema: VovkSchemaIdEnum.SCHEMA,
    meta: schema.meta,
    segments: Object.fromEntries(segmentNames.map((segmentName) => [segmentName, schema.segments[segmentName]])),
  };
}

export function omitSegmentFullSchema(schema: VovkSchema, segmentNames: string[]): VovkSchema {
  return {
    $schema: VovkSchemaIdEnum.SCHEMA,
    meta: schema.meta,
    segments: Object.fromEntries(
      Object.entries(schema.segments).filter(([segmentName]) => !segmentNames.includes(segmentName))
    ),
  };
}
