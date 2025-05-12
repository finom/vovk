import type { VovkFullSchema } from 'vovk';
import { SchemaOfTheSchema } from '../enums.mjs';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';
import generate from './index.mjs';

const getEmptySegmentRecordSchema = (segments: ProjectInfo['segments']) => {
  const result: VovkFullSchema['segments'] = {};
  for (const { segmentName } of segments) {
    result[segmentName] = {
      $schema: SchemaOfTheSchema.SEGMENT,
      segmentName,
      emitSchema: false,
      controllers: {},
    };
  }

  return result;
};

export default async function ensureClient(projectInfo: ProjectInfo) {
  return generate({
    isEnsuringClient: true,
    projectInfo,
    fullSchema: {
      $schema: SchemaOfTheSchema.FULL,
      config: {},
      segments: getEmptySegmentRecordSchema(projectInfo.segments),
    },
  });
}
