import path from 'node:path';
import * as chokidar from 'chokidar';
import type { VovkSchema } from 'vovk';
import {
  CONFIG_FILE_PATHS,
  getConfigAbsolutePaths,
} from '../get-project-info/get-config/get-config-absolute-paths.mjs';
import { getProjectInfo, loadOpenAPIMixins, type ProjectInfo } from '../get-project-info/index.mjs';
import type { GenerateOptions } from '../types.mjs';
import { chalkHighlightThing } from '../utils/chalk-highlight-thing.mjs';
import { locateSegments } from '../utils/locate-segments.mjs';
import { oneAtATime } from '../utils/one-at-a-time.mjs';
import { watchFolder } from '../utils/watch-folder.mjs';
import { generate } from './generate.mjs';
import { getProjectFullSchema } from './get-project-full-schema.mjs';
import { isOwnSchemaFolder } from './is-own-schema-folder.mjs';
import { omitRoutelessSegments } from './omit-routeless-segments.mjs';

const THROTTLE_DELAY = 5000;

// a writer that is not atomic truncates a file before writing it, so a change is read once the size stays the same
const AWAIT_WRITE_FINISH = { stabilityThreshold: 300, pollInterval: 50 };

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
      return;
    }

    // return the promise so one-shot generate errors reach the CLI error handler
    return this.generate();
  }

  async generate() {
    const fullSchema = await this.getFullSchema();
    const { log, config, apiDirAbsolutePath } = this.#projectInfo;
    const locatedSegments = await locateSegments({ dir: apiDirAbsolutePath, config, log });
    await generate({
      projectInfo: await loadOpenAPIMixins(this.#projectInfo),
      fullSchema: omitRoutelessSegments(
        fullSchema,
        locatedSegments,
        this.#projectInfo,
        this.#cliGenerateOptions.schemaPath
      ),
      forceNothingWrittenLog: this.#forceNothingWrittenLog,
      cliGenerateOptions: this.#cliGenerateOptions,
      locatedSegments,
    });
  }

  async getFullSchema(): Promise<VovkSchema> {
    const { log, config, cwd, isNextInstalled } = this.#projectInfo;
    const { schemaPath } = this.#cliGenerateOptions;

    const fullSchema = await getProjectFullSchema({
      schemaOutAbsolutePath: path.resolve(cwd, schemaPath ?? config.schemaOutDir),
      isOwnSchemaFolder: isOwnSchemaFolder(this.#projectInfo, schemaPath),
      isNextInstalled,
      log,
      config,
    });
    return fullSchema;
  }

  watch({ throttleDelay }: { throttleDelay: number }) {
    const { openapiSpec, schemaPath } = this.#cliGenerateOptions;
    const { log, cwd, config } = this.#projectInfo;
    const scheduleGeneration = this.#throttleGeneration(throttleDelay);
    void this.#watchProjectFiles(scheduleGeneration);

    if (openapiSpec) {
      log.debug(`Watching OpenAPI spec: ${openapiSpec}`);
      this.watchOpenApiSpec({ openApiSpec: openapiSpec, throttleDelay, scheduleGeneration });
    } else {
      const resolvedSchemaPath = path.resolve(cwd, schemaPath ?? config.schemaOutDir);
      log.debug(`Watching schema directory: ${resolvedSchemaPath}`);
      this.watchSchema({ schemaPath: resolvedSchemaPath, scheduleGeneration });
    }
  }

  // every watcher shares one generation, so two never overlap
  #throttleGeneration(throttleDelay: number) {
    let lastGenerationTime = 0;
    let pendingTimer: NodeJS.Timeout | null = null;

    // a change during a generation makes one more, which reads the newest files
    const generateCode = oneAtATime(async () => {
      try {
        lastGenerationTime = Date.now();
        await this.generate();
        this.#projectInfo.log.debug('Regenerated the client');
      } catch (error) {
        this.#projectInfo.log.error(
          `Failed to regenerate the client: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });

    return () => {
      const now = Date.now();

      // generate immediately outside the throttle window, otherwise defer to the end of it
      if (now - lastGenerationTime > throttleDelay) {
        void generateCode();
      } else if (!pendingTimer) {
        pendingTimer = setTimeout(
          () => {
            pendingTimer = null;
            void generateCode();
          },
          throttleDelay - (now - lastGenerationTime)
        );
      }
    };
  }

  // the config and package.json are read again on an edit, as vovk dev does
  async #watchProjectFiles(scheduleGeneration: () => void) {
    const { configPath, logLevel } = this.#cliGenerateOptions;
    const { cwd } = this.#projectInfo;
    const configPaths = configPath ? await getConfigAbsolutePaths({ cwd, configPath }) : CONFIG_FILE_PATHS;
    chokidar
      .watch([...configPaths, 'package.json'], { cwd, persistent: true, ignoreInitial: true, depth: 0 })
      .on('all', async (event, filePath) => {
        if (event !== 'change' && event !== 'add' && event !== 'unlink') return;
        try {
          this.#projectInfo = await getProjectInfo({ configPath, srcRootRequired: false, logLevel });
          this.#projectInfo.log.info(`${chalkHighlightThing(filePath)} has changed`);
          scheduleGeneration();
        } catch (error) {
          this.#projectInfo.log.error(
            `Failed to reload ${filePath}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      });
  }

  watchSchema({ schemaPath, scheduleGeneration }: { schemaPath: string; scheduleGeneration: () => void }) {
    const { log } = this.#projectInfo;

    watchFolder(schemaPath, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: AWAIT_WRITE_FINISH,
    })
      // "ready" never reaches the "all" listener, and ignoreInitial skips the files already there
      .on('ready', scheduleGeneration)
      .on('all', (event, path) => {
        if (event === 'change' || event === 'add' || event === 'unlink') {
          log.debug(`Schema file ${event}: ${path}`);
          scheduleGeneration();
        }
      });
  }

  watchOpenApiSpec({
    openApiSpec,
    throttleDelay,
    scheduleGeneration,
  }: {
    openApiSpec: string[];
    throttleDelay: number;
    scheduleGeneration: () => void;
  }) {
    const fileSpecs = openApiSpec.filter((spec) => !spec.startsWith('http://') && !spec.startsWith('https://'));
    const remoteSpecs = openApiSpec.filter((spec) => spec.startsWith('http://') || spec.startsWith('https://'));
    if (fileSpecs.length) {
      this.watchOpenApiSpecLocal({ openApiSpecPaths: fileSpecs, scheduleGeneration });
    }

    if (remoteSpecs.length) {
      remoteSpecs.forEach((spec) => {
        this.watchOpenApiSpecRemote({ openApiSpecUrl: spec, throttleDelay, scheduleGeneration });
      });
    }
  }

  watchOpenApiSpecLocal({
    openApiSpecPaths,
    scheduleGeneration,
  }: {
    openApiSpecPaths: string[];
    scheduleGeneration: () => void;
  }) {
    const { log, cwd } = this.#projectInfo;

    chokidar
      .watch(openApiSpecPaths, {
        cwd,
        persistent: true,
        ignoreInitial: false,
        awaitWriteFinish: AWAIT_WRITE_FINISH,
      })
      .on('all', (event, path) => {
        if (event === 'change' || event === 'add' || event === 'unlink') {
          log.debug(`OpenAPI spec file changed: ${path}`);
          scheduleGeneration();
        }
      });
  }

  watchOpenApiSpecRemote({
    openApiSpecUrl,
    throttleDelay,
    scheduleGeneration,
  }: {
    openApiSpecUrl: string;
    throttleDelay: number;
    scheduleGeneration: () => void;
  }) {
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

        if (content !== lastContent) {
          log.info(`Remote OpenAPI spec changed at ${chalkHighlightThing(openApiSpecUrl)}`);
          lastContent = content;
          scheduleGeneration();
        }
      } catch (error) {
        log.error(`Error polling OpenAPI spec: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        isPolling = false;
      }
    };

    pollRemoteSpec();

    setInterval(pollRemoteSpec, throttleDelay);
  }
}
