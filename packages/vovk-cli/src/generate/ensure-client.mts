import type { VovkSchema } from 'vovk';
import { VovkSchemaIdEnum } from 'vovk/internal';
import type { ProjectInfo } from '../get-project-info/index.mjs';
import { generate } from './generate.mjs';
import type { Segment } from '../utils/locate-segments.mjs';
import { getMetaSchema } from '../get-project-info/get-meta-schema.mjs';

const getEmptySegmentRecordSchema = (segmentNames: string[]) => {
  const result: VovkSchema['segments'] = {};
  for (const segmentName of segmentNames) {
    result[segmentName] = {
      $schema: VovkSchemaIdEnum.SEGMENT,
      segmentName,
      segmentType: 'segment',
      emitSchema: false,
      controllers: {},
    };
  }

  return result;
};

export async function ensureClient(projectInfo: ProjectInfo, locatedSegments: Segment[]) {
  return generate({
    isEnsuringClient: true,
    projectInfo,
    fullSchema: {
      $schema: VovkSchemaIdEnum.SCHEMA,
      segments: getEmptySegmentRecordSchema(locatedSegments.map(({ segmentName }) => segmentName)),
      meta: getMetaSchema({ config: projectInfo.config }),
    },
    locatedSegments,
  });
}
