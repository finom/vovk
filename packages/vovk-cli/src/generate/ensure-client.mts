import type { VovkSchema } from 'vovk';
import { VovkSchemaIdEnum } from 'vovk/internal';
import { getMetaSchema } from '../get-project-info/get-meta-schema.mjs';
import type { ProjectInfo } from '../get-project-info/index.mjs';
import type { Segment } from '../utils/locate-segments.mjs';
import { generate } from './generate.mjs';

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

// schemaPath: the schema folder when it isn't config.schemaOutDir, such as vovk dev --schema-out
export async function ensureClient(projectInfo: ProjectInfo, locatedSegments: Segment[], schemaPath?: string) {
  return generate({
    isEnsuringClient: true,
    projectInfo,
    fullSchema: {
      $schema: VovkSchemaIdEnum.SCHEMA,
      segments: getEmptySegmentRecordSchema(locatedSegments.map(({ segmentName }) => segmentName)),
      meta: getMetaSchema({ config: projectInfo.config }),
    },
    locatedSegments,
    cliGenerateOptions: { schemaPath },
  });
}
