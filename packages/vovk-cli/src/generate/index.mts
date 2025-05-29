import path from 'node:path';
import fs from 'node:fs/promises';
import { type VovkSchema, openAPIToSchema } from 'vovk';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import * as YAML from 'yaml';
import * as chokidar from 'chokidar';
import type { GenerateOptions } from '../types.mjs';
import { getProjectFullSchema } from './getProjectFullSchema.mjs';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';
import { generate } from './generate.mjs';
import { locateSegments } from '../locateSegments.mjs';
import chalkHighlightThing from '../utils/chalkHighlightThing.mjs';

const THROTTLE_DELAY = 5000;

export class VovkGenerate {
  #cliGenerateOptions: GenerateOptions;
  #projectInfo: ProjectInfo;
  #forceNothingWrittenLog: boolean;
  constructor({
    cliGenerateOptions,
    projectInfo,
    forceNothingWrittenLog,
  }: {
    cliGenerateOptions: GenerateOptions;
    projectInfo: ProjectInfo;
    forceNothingWrittenLog?: boolean;
  }) {
    this.#cliGenerateOptions = cliGenerateOptions;
    this.#projectInfo = projectInfo;
    this.#forceNothingWrittenLog = forceNothingWrittenLog ?? true;
  }

  start() {
    const { watch } = this.#cliGenerateOptions;
    if (watch) {
      const throttleDelay = typeof watch === 'boolean' ? THROTTLE_DELAY : parseFloat(watch) * 1e3 || THROTTLE_DELAY;
      this.watch({
        throttleDelay,
      });
    } else {
      this.generateFromOpenApiSpecOrSchema();
    }
  }
  async generate({ fullSchema }: { fullSchema: VovkSchema }) {
    const { log, config, apiDir, cwd } = this.#projectInfo;
    const locatedSegments = await locateSegments({ dir: path.join(cwd, apiDir), config, log });
    await generate({
      projectInfo: this.#projectInfo,
      fullSchema,
      forceNothingWrittenLog: this.#forceNothingWrittenLog,
      cliGenerateOptions: this.#cliGenerateOptions,
      locatedSegments,
    });
  }

  async generateFromOpenApiSpecOrSchema() {
    const { openapiSpec, schemaPath } = this.#cliGenerateOptions;

    if (openapiSpec) {
      return this.generateFromOpenApiSpec(openapiSpec);
    }

    return this.generateFromSchemaDir(schemaPath);
  }

  async generateFromSchemaDir(schemaPath: string | undefined) {
    const { log, config, cwd } = this.#projectInfo;
    const fullSchema = await getProjectFullSchema(path.resolve(cwd, schemaPath ?? config.schemaOutDir), log);

    return this.generate({ fullSchema });
  }

  async generateFromOpenApiSpec(openapiSpec: string) {
    if (!openapiSpec) {
      throw new Error('No OpenAPI spec provided. Please specify an OpenAPI spec using --openapi option.');
    }

    const openAPIObject =
      openapiSpec?.startsWith('http://') || openapiSpec?.startsWith('https://')
        ? await this.getOpenApiSpecRemote(openapiSpec)
        : await this.getOpenApiSpecLocal(openapiSpec);

    const fullSchema = openAPIToSchema({ openAPIObject });

    return this.generate({ fullSchema });
  }

  async getOpenApiSpecLocal(openApiSpecFilePath: string): Promise<OpenAPIObject> {
    const { cwd } = this.#projectInfo;
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

  async getOpenApiSpecRemote(openApiSpecUrl: string): Promise<OpenAPIObject> {
    const resp = await fetch(openApiSpecUrl);

    const text = await resp.text();

    if (!resp.ok) {
      throw new Error(`Failed to fetch OpenAPI spec from ${openApiSpecUrl}: ${resp.status} ${resp.statusText}`);
    }

    return text.trim().startsWith('{') || text.trim().startsWith('[')
      ? (JSON.parse(text) as OpenAPIObject)
      : (YAML.parse(text) as OpenAPIObject);
  }

  watch({ throttleDelay }: { throttleDelay: number }) {
    const { openapiSpec, schemaPath } = this.#cliGenerateOptions;
    const { log, cwd, config } = this.#projectInfo;

    if (openapiSpec) {
      log.debug(`Watching OpenAPI spec: ${openapiSpec}`);
      this.watchOpenApiSpec({ openApiSpec: openapiSpec, throttleDelay });
    } else {
      const resolvedSchemaPath = path.resolve(cwd, schemaPath ?? config.schemaOutDir);
      log.debug(`Watching schema directory: ${resolvedSchemaPath}`);
      this.watchSchema({ schemaPath: resolvedSchemaPath, throttleDelay });
    }
  }

  watchSchema({ schemaPath, throttleDelay }: { schemaPath: string; throttleDelay: number }) {
    const { log } = this.#projectInfo;
    let lastGenerationTime = 0;

    chokidar
      .watch(schemaPath, {
        persistent: true,
        ignoreInitial: true,
      })
      .on('all', (event, path) => {
        if (event === 'change' || event === 'add' || event === 'ready' || event === 'unlink') {
          log.debug(`Schema file ${event}: ${path}`);

          const now = Date.now();
          const shouldGenerateImmediately = now - lastGenerationTime > throttleDelay;

          const generateCode = async () => {
            try {
              lastGenerationTime = Date.now();
              await this.generateFromSchemaDir(schemaPath);
              log.debug(`Regenerated from schema changes`);
            } catch (error) {
              log.error(`Failed to regenerate from schema: ${error instanceof Error ? error.message : String(error)}`);
            }
          };

          // Generate immediately if it's been a while since the last generation
          if (shouldGenerateImmediately) {
            generateCode();
          }
        }
      });
  }

  watchOpenApiSpec({ openApiSpec, throttleDelay }: { openApiSpec: string; throttleDelay: number }) {
    if (openApiSpec.startsWith('http://') || openApiSpec.startsWith('https://')) {
      this.watchOpenApiSpecRemote({ openApiSpecUrl: openApiSpec, throttleDelay });
    } else {
      const { cwd } = this.#projectInfo;
      const openApiSpecAbsolutePath = path.resolve(cwd, openApiSpec);
      this.watchOpenApiSpecLocal({ openApiSpecPath: openApiSpecAbsolutePath, throttleDelay });
    }
  }

  watchOpenApiSpecLocal({ openApiSpecPath, throttleDelay }: { openApiSpecPath: string; throttleDelay: number }) {
    const { log } = this.#projectInfo;
    let lastGenerationTime = 0;

    chokidar
      .watch(openApiSpecPath, {
        persistent: true,
        ignoreInitial: true,
      })
      .on('all', (event, path) => {
        if (event === 'change' || event === 'add' || event === 'ready' || event === 'unlink') {
          log.debug(`OpenAPI spec file changed: ${path}`);

          const now = Date.now();
          const shouldGenerateImmediately = now - lastGenerationTime > throttleDelay;

          const generateCode = async () => {
            try {
              lastGenerationTime = Date.now();
              await this.generateFromOpenApiSpec(openApiSpecPath);
              log.debug(`Regenerated from OpenAPI spec changes`);
            } catch (error) {
              log.error(
                `Failed to regenerate from OpenAPI spec: ${error instanceof Error ? error.message : String(error)}`
              );
            }
          };

          // Generate immediately if it's been a while since the last generation
          if (shouldGenerateImmediately) {
            generateCode();
          }
        }
      });
  }

  watchOpenApiSpecRemote({ openApiSpecUrl, throttleDelay }: { openApiSpecUrl: string; throttleDelay: number }) {
    const { log } = this.#projectInfo;
    let lastContent: string | null = null;
    let isPolling = false;

    log.info(`Polling remote OpenAPI spec at ${chalkHighlightThing(openApiSpecUrl)} every ${throttleDelay}ms`);

    const pollRemoteSpec = async () => {
      if (isPolling) return;

      isPolling = true;
      try {
        const response = await fetch(openApiSpecUrl);
        if (!response.ok) {
          log.error(`Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`);
          return;
        }

        const content = await response.text();

        if (lastContent === null) {
          lastContent = content;
          return;
        }

        if (content !== lastContent) {
          log.info(`Remote OpenAPI spec changed at ${chalkHighlightThing(openApiSpecUrl)}`);
          lastContent = content;

          try {
            await this.generateFromOpenApiSpec(openApiSpecUrl);
            log.debug(`Regenerated from remote OpenAPI spec changes`);
          } catch (error) {
            log.error(
              `Failed to regenerate from OpenAPI spec: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        }
      } catch (error) {
        log.error(`Error polling OpenAPI spec: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        isPolling = false;
      }
    };

    // Initial fetch
    pollRemoteSpec();

    // Set up polling
    setInterval(pollRemoteSpec, throttleDelay);
  }
}
