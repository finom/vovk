import fs from 'node:fs/promises';
import path from 'node:path';
import { HttpMethod, VovkOperationObject, VovkStrictConfig, type VovkConfig } from 'vovk';
import { OpenAPIObject } from 'openapi3-ts/oas31';
import * as YAML from 'yaml';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';
import chalkHighlightThing from './chalkHighlightThing.mjs';
import camelCase from 'lodash/camelCase.js';
import { generateFnName } from './generateFnName.mjs';

type OpenAPIMixin = NonNullable<
  NonNullable<NonNullable<NonNullable<VovkConfig['outputConfig']>['segments']>[string]>['openAPIMixin']
>;

type OpenAPIMixinStrict = NonNullable<
  NonNullable<NonNullable<NonNullable<VovkStrictConfig['outputConfig']>['segments']>[string]>['openAPIMixin']
>;

export type GetOpenAPINameFn = (config: {
  operationObject: VovkOperationObject;
  method: HttpMethod;
  path: string;
  openAPIObject: OpenAPIObject;
}) => string;

const normalizeGetModuleName = (getModuleName: OpenAPIMixin['getModuleName']): OpenAPIMixinStrict['getMethodName'] => {
  if (typeof getModuleName === 'string') {
    const moduleName = getModuleName;
    getModuleName = () => moduleName;
  } else if (typeof getModuleName !== 'function') {
    throw new Error('getModuleName must be a function or one of the predefined strings');
  }

  return getModuleName;
};

const normalizeGetMethodName = (getMethodName: OpenAPIMixin['getMethodName']) => {
  if (getMethodName === 'camel-case-operation-id') {
    getMethodName = ({ operationObject }: Parameters<GetOpenAPINameFn>[0]) => {
      const operationId = operationObject.operationId;
      if (!operationId) {
        throw new Error('Operation ID is required for camel-case method name generation');
      }
      return camelCase(operationId);
    };
  } else if (getMethodName === 'auto') {
    getMethodName = ({ operationObject, method, path }: Parameters<GetOpenAPINameFn>[0]) => {
      const operationId = operationObject.operationId;
      const isCamelCase = operationId && /^[a-z][a-zA-Z0-9]*$/.test(operationId);
      const isSnakeCase = operationId && /^[a-z][a-z0-9_]+$/.test(operationId);

      return isCamelCase ? operationId : isSnakeCase ? camelCase(operationId) : generateFnName(method, path);
    };
  } else if (typeof getMethodName !== 'function') {
    throw new Error('getMethodName must be a function or one of the predefined strings');
  }

  return getMethodName;
};

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

async function getOpenApiSpecRemote({
  cwd,
  url,
  fallback,
  log,
}: {
  cwd: string;
  url: string;
  fallback?: string;
  log: ProjectInfo['log'];
}): Promise<OpenAPIObject> {
  const resp = await fetch(url);
  const text = await resp.text();

  if (!resp.ok) {
    if (fallback) {
      log.warn(
        `Failed to fetch OpenAPI spec from ${chalkHighlightThing(url)}: ${resp.status} ${resp.statusText}. Falling back to ${chalkHighlightThing(fallback)}`
      );
      return getOpenApiSpecLocal(fallback, cwd);
    }

    throw new Error(`Failed to fetch OpenAPI spec from ${chalkHighlightThing(url)}: ${resp.status} ${resp.statusText}`);
  }

  if (fallback) {
    const fallbackAbsolutePath = path.resolve(cwd, fallback);
    const existingFallback = await fs.readFile(fallbackAbsolutePath, 'utf8').catch(() => null);
    if (existingFallback !== text) {
      await fs.mkdir(path.dirname(fallbackAbsolutePath), { recursive: true });
      await fs.writeFile(fallbackAbsolutePath, text);
      log.info(`Saved OpenAPI spec to fallback file ${chalkHighlightThing(fallbackAbsolutePath)}`);
    } else {
      log.debug(
        `OpenAPI spec at ${chalkHighlightThing(url)} is unchanged. Skipping write to fallback file ${chalkHighlightThing(fallbackAbsolutePath)}`
      );
    }
  }

  return (
    text.trim().startsWith('{') || text.trim().startsWith('[') ? JSON.parse(text) : YAML.parse(text)
  ) as OpenAPIObject;
}

export async function normalizeOpenAPIMixin({
  // mixinName,
  mixinModule,
  log,
  cwd = process.cwd(),
}: {
  mixinModule: NonNullable<
    NonNullable<NonNullable<NonNullable<VovkConfig['outputConfig']>['segments']>[string]>['openAPIMixin']
  >;
  log: ProjectInfo['log'];
  cwd?: string;
}): Promise<
  NonNullable<
    NonNullable<NonNullable<NonNullable<VovkStrictConfig['outputConfig']>['segments']>[string]>['openAPIMixin']
  >
> {
  const { source, getModuleName, getMethodName } = mixinModule;
  let openAPIObject: OpenAPIObject;
  if ('url' in source) {
    openAPIObject = await getOpenApiSpecRemote({ url: source.url, fallback: source.fallback, log, cwd });
  } else if ('file' in source) {
    openAPIObject = await getOpenApiSpecLocal(source.file, cwd);
  } else if ('object' in source) {
    openAPIObject = source.object;
  } else {
    throw new Error('Invalid source type for OpenAPI configuration');
  }

  return {
    ...mixinModule,
    source: { object: openAPIObject },
    getModuleName: normalizeGetModuleName(getModuleName),
    getMethodName: normalizeGetMethodName(getMethodName),
  };
}
