import fs from 'fs/promises';
import path from 'node:path';
import ejs from 'ejs';
import _ from 'lodash';
import type { VovkFullSchema } from 'vovk';
import prettify from '../utils/prettify.mjs';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';
import type { ClientTemplateFile } from './getClientTemplateFiles.mjs';
import type { ClientImports } from './getTemplateClientImports.mjs';
import type { PackageJson } from 'type-fest';
import { ROOT_SEGMENT_SCHEMA_NAME, SEGMENTS_SCHEMA_DIR_NAME } from '../dev/writeOneSegmentSchemaFile.mjs';

export default async function writeOneClientFile({
  cwd,
  projectInfo,
  clientTemplateFile,
  fullSchema,
  prettifyClient,
  segmentName,
  imports,
  templateContent,
  matterResult: { data, content },
  package: packageJson,
  isEnsuringClient,
  outCwdRelativeDir,
  origin,
}: {
  cwd: string;
  projectInfo: ProjectInfo;
  clientTemplateFile: ClientTemplateFile;
  fullSchema: VovkFullSchema;
  prettifyClient: boolean;
  segmentName: string | null; // null for full client
  imports: ClientImports;
  templateContent: string;
  matterResult: {
    data: {
      imports?: string[];
    };
    content: string;
  };
  package: PackageJson;
  isEnsuringClient: boolean;
  outCwdRelativeDir: string;
  origin: string | null;
}) {
  const { config, apiRoot, segments } = projectInfo;
  const { templateFilePath, relativeDir } = clientTemplateFile;

  const outPath = path.join(
    cwd,
    outCwdRelativeDir,
    typeof segmentName === 'string' ? segmentName || ROOT_SEGMENT_SCHEMA_NAME : '',
    relativeDir.replace('[package_name]', packageJson.name ?? 'my-package-name'),
    path.basename(templateFilePath).replace('.ejs', '')
  );

  let placeholder = `// This is a temporary placeholder to avoid compilation errors if client is imported before it's generated.
// If you still see this text, the client is not generated yet because of an unknown problem.
// Feel free to report an issue at https://github.com/finom/vovk/issues`;
  placeholder = outPath.endsWith('.py') ? placeholder.replace(/\/\//g, '#') : placeholder;

  // Data for the EJS templates:
  const t = {
    _, // lodash
    package: packageJson,
    ROOT_SEGMENT_SCHEMA_NAME,
    SEGMENTS_SCHEMA_DIR_NAME,
    apiRoot: origin ? `${origin}/${config.rootEntry}` : apiRoot,
    imports,
    fullSchema,
    schemaOutDir:
      typeof segmentName === 'string'
        ? path.relative(path.join(outCwdRelativeDir, segmentName || ROOT_SEGMENT_SCHEMA_NAME), config.schemaOutDir)
        : path.relative(outCwdRelativeDir, config.schemaOutDir),
    segmentMeta: Object.fromEntries(
      segments.map(({ segmentName: sName, routeFilePath }) => {
        const segmentImportPath = path.relative(
          path.resolve(
            cwd,
            outCwdRelativeDir,
            typeof segmentName === 'string' ? segmentName || ROOT_SEGMENT_SCHEMA_NAME : '.'
          ),
          path.resolve(cwd, routeFilePath)
        );
        return [
          sName,
          {
            routeFilePath,
            segmentImportPath,
          },
        ];
      })
    ),
  };

  if (data.imports instanceof Array) {
    for (const imp of data.imports) {
      t.imports = {
        ...t.imports,
        [imp]: await import(imp),
      };
    }
  }

  // Render the template
  let rendered = templateFilePath.endsWith('.ejs')
    ? ejs.render(
        content,
        { t },
        {
          filename: templateFilePath,
        }
      )
    : templateContent;

  // Optionally prettify
  if (prettifyClient || config.prettifyClient) {
    rendered = await prettify(rendered, outPath);
  }

  if (isEnsuringClient) {
    rendered = rendered + `\n\n${placeholder}`;
  }

  // Read existing file content to compare
  const existingContent = await fs.readFile(outPath, 'utf-8').catch(() => null);

  // Determine if we need to rewrite the file, ignore 1st line
  const needsWriting = isEnsuringClient
    ? !existingContent
    : !existingContent ||
      existingContent.trim().split('\n').slice(1).join('\n') !== rendered.trim().split('\n').slice(1).join('\n');

  if (needsWriting) {
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, rendered, 'utf-8');
  }

  return { written: needsWriting };
}
