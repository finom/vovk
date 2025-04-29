import type { ProjectInfo } from '../getProjectInfo/index.mjs';
import generate from './index.mjs';
import type { VovkFullSchema } from 'vovk';

const getEmptySegmentRecordSchema = (segments: ProjectInfo['segments']) => {
  const result: VovkFullSchema['segments'] = {};
  for (const { segmentName } of segments) {
    result[segmentName] = {
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
      config: {},
      segments: getEmptySegmentRecordSchema(projectInfo.segments),
    },
  });
}
