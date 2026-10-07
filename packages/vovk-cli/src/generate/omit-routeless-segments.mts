import type { VovkSchema } from 'vovk';
import type { ProjectInfo } from '../get-project-info/index.mjs';
import { formatLoggedSegmentName } from '../utils/format-logged-segment-name.mjs';
import type { Segment } from '../utils/locate-segments.mjs';
import { isOwnSchemaFolder } from './is-own-schema-folder.mjs';

// in a Next.js project, a segment schema without a route file is left over from a removed segment;
// the route files describe the project's own schema folder only, not one given with --schema-path
export function omitRoutelessSegments(
  fullSchema: VovkSchema,
  locatedSegments: Segment[],
  { srcRoot, log, cwd, config }: Pick<ProjectInfo, 'srcRoot' | 'log' | 'cwd' | 'config'>,
  schemaPath: string | undefined
): VovkSchema {
  if (!isOwnSchemaFolder({ srcRoot, cwd, config }, schemaPath)) {
    return fullSchema;
  }

  const segments = Object.entries(fullSchema.segments).filter(([segmentName, { segmentType }]) => {
    if (segmentType === 'mixin' || locatedSegments.some((segment) => segment.segmentName === segmentName)) return true;

    log.warn(
      `${formatLoggedSegmentName(segmentName, { upperFirst: true })} has a schema file but no route file, so it is left out of the client. Delete the schema file if the segment was removed.`
    );
    return false;
  });

  return { ...fullSchema, segments: Object.fromEntries(segments) };
}
