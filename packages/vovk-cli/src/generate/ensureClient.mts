import { VovkSchemaIdEnum, type VovkSchema } from 'vovk';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';
import { generate } from './generate.mjs';
import type { Segment } from '../locateSegments.mjs';
import getMetaSchema from '../getProjectInfo/getMetaSchema.mjs';

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

export default async function ensureClient(projectInfo: ProjectInfo, locatedSegments: Segment[]) {
  return generate({
    isEnsuringClient: true,
    projectInfo,
    fullSchema: {
      $schema: VovkSchemaIdEnum.SCHEMA,
      segments: getEmptySegmentRecordSchema(locatedSegments.map(({ segmentName }) => segmentName)),
      meta: getMetaSchema({ config: projectInfo.config, package: projectInfo.packageJson }),
    },
    locatedSegments,
  });
}
