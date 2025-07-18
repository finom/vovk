import fs from 'node:fs/promises';
import path from 'node:path';
import { VovkStrictConfig, type VovkConfig } from 'vovk';
import { OpenAPIObject } from 'openapi3-ts/oas31';
import * as YAML from 'yaml';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';
import chalkHighlightThing from './chalkHighlightThing.mjs';

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

export async function normalizeOpenAPIMixins({
  mixinModules,
  log,
  cwd = process.cwd(),
}: {
  mixinModules: NonNullable<VovkConfig['openApiMixins']>;
  log: ProjectInfo['log'];
  cwd?: string;
}): Promise<VovkStrictConfig['openApiMixins']> {
  if (mixinModules) {
    const modules = await Promise.all(
      Object.entries(mixinModules).map(
        async ([
          mixinName,
          { source, apiRoot, getModuleName, getMethodName, errorMessageKey, package: packageJson },
        ]) => {
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
            source: { object: openAPIObject },
            apiRoot,
            getModuleName,
            getMethodName,
            errorMessageKey,
            package: packageJson,
            mixinName,
          };
        }
      )
    );

    return Object.fromEntries(modules.map((module) => [module.mixinName, module]));
  }

  return {};
}
