import path from 'path';
import fs from 'fs/promises';
import type { ProjectInfo } from '../getProjectInfo';
import type { Segment } from '../locateSegments';

export default async function generateClient(projectInfo: ProjectInfo, segments: Segment[]) {
  const outDir = projectInfo.clientOutFullPath;
  let dts = `// auto-generated
/* eslint-disable */
import type { clientizeController } from 'vovk/client';
import type { promisifyWorker } from 'vovk/worker';
import type { VovkClientFetcher } from 'vovk/client';
import type fetcher from '${projectInfo.fetcherClientImportPath}';

`;
  let js = `// auto-generated
/* eslint-disable */
const { clientizeController } = require('vovk/client');
const { promisifyWorker } = require('vovk/worker');
const { default: fetcher } = require('${projectInfo.fetcherClientImportPath}');
const metadata = require('${projectInfo.metadataOutImportPath}');
`;
  let ts = `// auto-generated
/* eslint-disable */
import { clientizeController } from 'vovk/client';
import { promisifyWorker } from 'vovk/worker';
import type { VovkClientFetcher } from 'vovk/client';
import fetcher from '${projectInfo.fetcherClientImportPath}';
import metadata from '${projectInfo.metadataOutImportPath}';

`;
  for (let i = 0; i < segments.length; i++) {
    const { routeFilePath } = segments[i];
    const importRouteFilePath = path.relative(projectInfo.config.clientOutDir, routeFilePath);

    dts += `import type { Controllers as Controllers${i}, Workers as Workers${i} } from "${importRouteFilePath}";\n`;
    ts += `import type { Controllers as Controllers${i}, Workers as Workers${i} } from "${importRouteFilePath}";\n`;
  }

  dts += `
type Options = typeof fetcher extends VovkClientFetcher<infer U> ? U : never;
  `;
  ts += `
type Options = typeof fetcher extends VovkClientFetcher<infer U> ? U : never;
const prefix = '${projectInfo.apiPrefix}';
  `;
  js += `
const prefix = '${projectInfo.apiPrefix}';
`;

  for (let i = 0; i < segments.length; i++) {
    const { segmentName, metadata } = segments[i];

    if (!metadata) {
      throw new Error(`No metadata found for segment ${segmentName}`);
    }

    for (const key of Object.keys(metadata.controllers)) {
      dts += `export const ${key}: ReturnType<typeof clientizeController<Controllers${i}["${key}"], Options>>;\n`;
      js += `exports.${key} = clientizeController(metadata['${segmentName}'].controllers.${key}, { fetcher, defaultOptions: { prefix } });\n`;
      ts += `export const ${key} = clientizeController<Controllers${i}["${key}"], Options>(metadata['${segmentName}'].controllers.${key}, { fetcher, defaultOptions: { prefix } });\n`;
    }

    for (const key of Object.keys(metadata.workers)) {
      dts += `export const ${key}: ReturnType<typeof promisifyWorker<Workers${i}["${key}"]>>;\n`;
      js += `exports.${key} = promisifyWorker(null, metadata['${segmentName}'].workers.${key});\n`;
      ts += `export const ${key} = promisifyWorker<Workers${i}["${key}"]>(null, metadata['${segmentName}'].workers.${key});\n`;
    }
  }

  const localJsPath = path.join(outDir, 'client.js');
  const localDtsPath = path.join(outDir, 'client.d.ts');
  const localTsPath = path.join(outDir, 'index.ts');
  const existingJs = await fs.readFile(localJsPath, 'utf-8').catch(() => '');
  const existingDts = await fs.readFile(localDtsPath, 'utf-8').catch(() => '');
  const existingTs = await fs.readFile(localTsPath, 'utf-8').catch(() => '');

  if (existingJs === js && existingDts === dts && existingTs === ts) return { written: false, path: outDir };

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(localJsPath, js);
  await fs.writeFile(localDtsPath, dts);
  await fs.writeFile(localTsPath, ts);

  return { written: true, path: outDir };
}
