import type { VovkSchema } from 'vovk';
import { SchemaIdEnum } from '../enums.mjs';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';
import generate from './index.mjs';

const getEmptySegmentRecordSchema = (segments: ProjectInfo['segments']) => {
  const result: VovkSchema['segments'] = {};
  for (const { segmentName } of segments) {
    result[segmentName] = {
      $schema: SchemaIdEnum.SEGMENT,
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
      $schema: SchemaIdEnum.FULL,
      config: {},
      segments: getEmptySegmentRecordSchema(projectInfo.segments),
    },
  });
}
