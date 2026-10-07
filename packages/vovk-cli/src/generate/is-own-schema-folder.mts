import path from 'node:path';
import type { ProjectInfo } from '../get-project-info/index.mjs';

// the schema folder vovk dev writes in this Next.js project, not a folder of another project given with --schema-path
export function isOwnSchemaFolder(
  { srcRoot, cwd, config }: Pick<ProjectInfo, 'srcRoot' | 'cwd' | 'config'>,
  schemaPath: string | undefined
) {
  return !!srcRoot && (!schemaPath || path.resolve(cwd, schemaPath) === path.resolve(cwd, config.schemaOutDir));
}
