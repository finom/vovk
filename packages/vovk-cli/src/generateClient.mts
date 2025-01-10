import path from 'node:path';
import fs from 'node:fs/promises';
import type { VovkSchema } from 'vovk';
import type { ProjectInfo } from './getProjectInfo/index.mjs';
import type { Segment } from './locateSegments.mjs';
import formatLoggedSegmentName from './utils/formatLoggedSegmentName.mjs';
import prettify from './utils/prettify.mjs';

export default async function generateClient(
  projectInfo: ProjectInfo,
  segments: Segment[],
  segmentsSchema: Record<string, VovkSchema>
) {
  console.log('generateClient');
  const { config, cwd, log, validateOnClientImportPath, apiEntryPoint, fetcherClientImportPath, schemaOutImportPath } =
    projectInfo;
  const now = Date.now();
  const clientoOutDirAbsolutePath = path.join(cwd, config.clientOutDir);
  let dts = `// auto-generated
/* eslint-disable */
import type { clientizeController } from 'vovk/client';
import type { promisifyWorker } from 'vovk/worker';
import type { VovkClientFetcher } from 'vovk/client';
import type fetcher from '${fetcherClientImportPath}';

`;
  let js = `// auto-generated
/* eslint-disable */
const { clientizeController } = require('vovk/client');
const { promisifyWorker } = require('vovk/worker');
const { default: fetcher } = require('${fetcherClientImportPath}');
const schema = require('${schemaOutImportPath}');
`;
  let ts = `// auto-generated
/* eslint-disable */
import { clientizeController } from 'vovk/client';
import { promisifyWorker } from 'vovk/worker';
import type { VovkClientFetcher } from 'vovk/client';
import fetcher from '${fetcherClientImportPath}';
import schema from '${schemaOutImportPath}';

`;
  for (let i = 0; i < segments.length; i++) {
    const { routeFilePath, segmentName } = segments[i];
    const schema = segmentsSchema[segmentName];
    if (!schema) {
      throw new Error(`Unable to generate client. No schema found for ${formatLoggedSegmentName(segmentName)}`);
    }
    if (!schema.emitSchema) continue;
    const importRouteFilePath = path.relative(config.clientOutDir, routeFilePath);

    dts += `import type { Controllers as Controllers${i}, Workers as Workers${i} } from "${importRouteFilePath}";\n`;
    ts += `import type { Controllers as Controllers${i}, Workers as Workers${i} } from "${importRouteFilePath}";\n`;
  }

  dts += `
type Options = typeof fetcher extends VovkClientFetcher<infer U> ? U : never;
`;
  ts += `
${validateOnClientImportPath ? `import validateOnClient from '${validateOnClientImportPath}';\n` : '\nconst validateOnClient = undefined;'}
type Options = typeof fetcher extends VovkClientFetcher<infer U> ? U : never;
const apiRoot = '${apiEntryPoint}';
`;
  js += `
const { default: validateOnClient = null } = ${validateOnClientImportPath ? `require('${validateOnClientImportPath}')` : '{}'};
const apiRoot = '${apiEntryPoint}';
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
      js += `exports.${key} = clientizeController(schema['${segmentName}'].controllers.${key}, '${segmentName}', { fetcher, validateOnClient, defaultOptions: { apiRoot } });\n`;
      ts += `export const ${key} = clientizeController<Controllers${i}["${key}"], Options>(schema['${segmentName}'].controllers.${key}, '${segmentName}', { fetcher, validateOnClient, defaultOptions: { apiRoot } });\n`;
    }

    for (const key of Object.keys(schema.workers)) {
      dts += `export const ${key}: ReturnType<typeof promisifyWorker<Workers${i}["${key}"]>>;\n`;
      js += `exports.${key} = promisifyWorker(null, schema['${segmentName}'].workers.${key});\n`;
      ts += `export const ${key} = promisifyWorker<Workers${i}["${key}"]>(null, schema['${segmentName}'].workers.${key});\n`;
    }
  }

  const localJsAbsolutePath = path.join(clientoOutDirAbsolutePath, 'client.js');
  const localDtsAbsolutePath = path.join(clientoOutDirAbsolutePath, 'client.d.ts');
  const localTsAbsolutePath = path.join(clientoOutDirAbsolutePath, 'index.ts');
  const existingJs = await fs.readFile(localJsAbsolutePath, 'utf-8').catch(() => '');
  const existingDts = await fs.readFile(localDtsAbsolutePath, 'utf-8').catch(() => '');
  const existingTs = await fs.readFile(localTsAbsolutePath, 'utf-8').catch(() => '');

  if (config.prettifyClient) {
    js = await prettify(js, localJsAbsolutePath);
    dts = await prettify(dts, localDtsAbsolutePath);
    ts = await prettify(ts, localTsAbsolutePath);
  }

  if (existingJs === js && existingDts === dts && existingTs === ts) {
    log.debug(`Client is up to date and doesn't need to be regenerated (${Date.now() - now}ms)`);
    return { written: false, path: clientoOutDirAbsolutePath };
  }

  await fs.mkdir(clientoOutDirAbsolutePath, { recursive: true });
  await fs.writeFile(localJsAbsolutePath, js);
  await fs.writeFile(localDtsAbsolutePath, dts);
  await fs.writeFile(localTsAbsolutePath, ts);

  log.info(`Client generated in ${Date.now() - now}ms`);

  return { written: true, path: clientoOutDirAbsolutePath };
}
