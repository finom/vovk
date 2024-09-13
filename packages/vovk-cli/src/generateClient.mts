import path from 'path';
import fs from 'fs/promises';
import type { ProjectInfo } from './getProjectInfo/index.mjs';
import type { Segment } from './locateSegments.mjs';
import type { VovkSchema } from 'vovk';
import formatLoggedSegmentName from './utils/formatLoggedSegmentName.mjs';

export default async function generateClient(
  projectInfo: ProjectInfo,
  segments: Segment[],
  segmentsSchema: Record<string, VovkSchema>
) {
  const now = Date.now();
  const clientoOutDirFullPath = path.join(projectInfo.cwd, projectInfo.config.clientOutDir);
  const validateFullPath = projectInfo.config.validateOnClient?.startsWith('.')
    ? path.join(projectInfo.cwd, projectInfo.config.validateOnClient)
    : projectInfo.config.validateOnClient;
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
const schema = require('${projectInfo.schemaOutImportPath}');
`;
  let ts = `// auto-generated
/* eslint-disable */
import { clientizeController } from 'vovk/client';
import { promisifyWorker } from 'vovk/worker';
import type { VovkClientFetcher } from 'vovk/client';
import fetcher from '${projectInfo.fetcherClientImportPath}';
import schema from '${projectInfo.schemaOutImportPath}';

`;
  for (let i = 0; i < segments.length; i++) {
    const { routeFilePath, segmentName } = segments[i];
    const schema = segmentsSchema[segmentName];
    if (!schema) {
      throw new Error(`Unable to generate client. No schema found for ${formatLoggedSegmentName(segmentName)}`);
    }
    if (!schema.emitSchema) continue;
    const importRouteFilePath = path.relative(projectInfo.config.clientOutDir, routeFilePath);

    dts += `import type { Controllers as Controllers${i}, Workers as Workers${i} } from "${importRouteFilePath}";\n`;
    ts += `import type { Controllers as Controllers${i}, Workers as Workers${i} } from "${importRouteFilePath}";\n`;
  }

  dts += `
type Options = typeof fetcher extends VovkClientFetcher<infer U> ? U : never;
`;
  ts += `
${validateFullPath ? `import validateOnClient from '${validateFullPath}';\n` : '\nconst validateOnClient = undefined;'}
type Options = typeof fetcher extends VovkClientFetcher<infer U> ? U : never;
const prefix = '${projectInfo.apiEntryPoint}';
`;
  js += `
const { default: validateOnClient = null } = ${validateFullPath ? `require('${validateFullPath}')` : '{}'};
const prefix = '${projectInfo.apiEntryPoint}';
`;

  for (let i = 0; i < segments.length; i++) {
    const { segmentName } = segments[i];
    const schema = segmentsSchema[segmentName];
    if (!schema) {
      throw new Error(`Unable to generate client. No schema found for ${formatLoggedSegmentName(segmentName)}`);
    }
    if (!schema.emitSchema) continue;

    for (const key of Object.keys(schema.controllers)) {
      dts += `export const ${key}: ReturnType<typeof clientizeController<Controllers${i}["${key}"], Options>>;\n`;
      js += `exports.${key} = clientizeController(schema['${segmentName}'].controllers.${key}, '${segmentName}', { fetcher, validateOnClient, defaultOptions: { prefix } });\n`;
      ts += `export const ${key} = clientizeController<Controllers${i}["${key}"], Options>(schema['${segmentName}'].controllers.${key}, '${segmentName}', { fetcher, validateOnClient, defaultOptions: { prefix } });\n`;
    }

    for (const key of Object.keys(schema.workers)) {
      dts += `export const ${key}: ReturnType<typeof promisifyWorker<Workers${i}["${key}"]>>;\n`;
      js += `exports.${key} = promisifyWorker(null, schema['${segmentName}'].workers.${key});\n`;
      ts += `export const ${key} = promisifyWorker<Workers${i}["${key}"]>(null, schema['${segmentName}'].workers.${key});\n`;
    }
  }

  const localJsPath = path.join(clientoOutDirFullPath, 'client.js');
  const localDtsPath = path.join(clientoOutDirFullPath, 'client.d.ts');
  const localTsPath = path.join(clientoOutDirFullPath, 'index.ts');
  const existingJs = await fs.readFile(localJsPath, 'utf-8').catch(() => '');
  const existingDts = await fs.readFile(localDtsPath, 'utf-8').catch(() => '');
  const existingTs = await fs.readFile(localTsPath, 'utf-8').catch(() => '');

  if (existingJs === js && existingDts === dts && existingTs === ts) {
    projectInfo.log.info(`Client is up to date and doesn't need to be regenerated (${Date.now() - now}ms)`);
    return { written: false, path: clientoOutDirFullPath };
  }

  await fs.mkdir(clientoOutDirFullPath, { recursive: true });
  await fs.writeFile(localJsPath, js);
  await fs.writeFile(localDtsPath, dts);
  await fs.writeFile(localTsPath, ts);

  projectInfo.log.info(`Client generated in ${Date.now() - now}ms`);

  return { written: true, path: clientoOutDirFullPath };
}
