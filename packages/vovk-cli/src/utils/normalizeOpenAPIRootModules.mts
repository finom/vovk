import fs from 'node:fs/promises';
import path from 'node:path';
import { VovkStrictConfig, type VovkConfig } from 'vovk';
import { OpenAPIObject } from 'openapi3-ts/oas31';
import * as YAML from 'yaml';

async function getOpenApiSpecLocal(openApiSpecFilePath: string, cwd: string): Promise<OpenAPIObject> {
  const openApiSpecAbsolutePath = path.resolve(cwd, openApiSpecFilePath);
  const fileName = path.basename(openApiSpecAbsolutePath);
  if (!fileName.endsWith('.json') && !fileName.endsWith('.yaml') && !fileName.endsWith('.yml')) {
    throw new Error(`Invalid OpenAPI spec file format: ${fileName}. Please provide a JSON or YAML file.`);
  }

  const openApiSpecContent = await fs.readFile(openApiSpecAbsolutePath, 'utf8');
  return (
    fileName.endsWith('.json') ? JSON.parse(openApiSpecContent) : YAML.parse(openApiSpecContent)
  ) as OpenAPIObject;
}

async function getOpenApiSpecRemote(openApiSpecUrl: string): Promise<OpenAPIObject> {
  const resp = await fetch(openApiSpecUrl);
  const text = await resp.text();

  if (!resp.ok) {
    throw new Error(`Failed to fetch OpenAPI spec from ${openApiSpecUrl}: ${resp.status} ${resp.statusText}`);
  }

  return (
    text.trim().startsWith('{') || text.trim().startsWith('[') ? JSON.parse(text) : YAML.parse(text)
  ) as OpenAPIObject;
}

export async function normalizeOpenAPIRootModules({
  rootModules,
  cwd = process.cwd(),
}: {
  rootModules: Exclude<VovkConfig['extendClientWithOpenAPI'], undefined>['rootModules'];
  cwd?: string;
}): Promise<VovkStrictConfig['extendClientWithOpenAPI']['rootModules']> {
  if (rootModules) {
    const modules = await Promise.all(
      rootModules.map(async ({ source, apiRoot, getModuleName, getMethodName }) => {
        let openAPIObject: OpenAPIObject;
        if ('url' in source) {
          openAPIObject = await getOpenApiSpecRemote(source.url);
        } else if ('file' in source) {
          openAPIObject = await getOpenApiSpecLocal(source.file, cwd);
        } else if ('object' in source) {
          openAPIObject = source.object;
        } else {
          throw new Error('Invalid source type for OpenAPI configuration');
        }

        const apiRootResolved = apiRoot ?? openAPIObject.servers?.[0]?.url;

        if (!apiRootResolved) {
          throw new Error('API root URL is required in OpenAPI configuration');
        }

        return {
          source: { object: openAPIObject },
          apiRoot: apiRootResolved,
          getModuleName,
          getMethodName,
        };
      })
    );

    return modules;
  }

  return [];
}
