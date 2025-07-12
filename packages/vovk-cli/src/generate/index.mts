import path from 'node:path';
import { type VovkSchema } from 'vovk';
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
      this.watch({ throttleDelay });
    } else {
      this.generate();
    }
  }

  async generate() {
    const fullSchema = await this.getFullSchema();
    const { log, config, apiDirAbsolutePath } = this.#projectInfo;
    const locatedSegments = await locateSegments({ dir: apiDirAbsolutePath, config, log });
    await generate({
      projectInfo: this.#projectInfo,
      fullSchema,
      forceNothingWrittenLog: this.#forceNothingWrittenLog,
      cliGenerateOptions: this.#cliGenerateOptions,
      locatedSegments,
    });
  }

  async getFullSchema(): Promise<VovkSchema> {
    const { log, config, cwd } = this.#projectInfo;
    const { schemaPath } = this.#cliGenerateOptions;
    const fullSchema = await getProjectFullSchema(path.resolve(cwd, schemaPath ?? config.schemaOutDir), log);
    return fullSchema;
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
              await this.generate();
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

  watchOpenApiSpec({ openApiSpec, throttleDelay }: { openApiSpec: string[]; throttleDelay: number }) {
    const fileSpecs = openApiSpec.filter((spec) => !spec.startsWith('http://') && !spec.startsWith('https://'));
    const remoteSpecs = openApiSpec.filter((spec) => spec.startsWith('http://') || spec.startsWith('https://'));
    if (fileSpecs.length) {
      this.watchOpenApiSpecLocal({
        openApiSpecPaths: fileSpecs,
        throttleDelay,
      });
    }

    if (remoteSpecs.length) {
      remoteSpecs.forEach((spec) => {
        this.watchOpenApiSpecRemote({
          openApiSpecUrl: spec,
          throttleDelay,
        });
      });
    }
  }

  watchOpenApiSpecLocal({ openApiSpecPaths, throttleDelay }: { openApiSpecPaths: string[]; throttleDelay: number }) {
    const { log, cwd } = this.#projectInfo;
    let lastGenerationTime = 0;

    chokidar
      .watch(openApiSpecPaths, {
        cwd,
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
              await this.generate();
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
        const response = await fetch(openApiSpecUrl, {
          headers: {
            Accept: 'application/json, application/yaml',
          },
        });
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
            await this.generate();
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
