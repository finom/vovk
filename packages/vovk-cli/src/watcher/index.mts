import fs from 'node:fs/promises';
import path from 'node:path';
import type { VovkSchema } from 'vovk';
import * as chokidar from 'chokidar';
import { Agent, setGlobalDispatcher } from 'undici';
import keyBy from 'lodash/keyBy.js';
import capitalize from 'lodash/capitalize.js';
import debounce from 'lodash/debounce.js';
import isEmpty from 'lodash/isEmpty.js';
import { debouncedEnsureSchemaFiles } from './ensureSchemaFiles.mjs';
import writeOneSchemaFile from './writeOneSchemaFile.mjs';
import logDiffResult from './logDiffResult.mjs';
import ensureClient from './ensureClient.mjs';
import getProjectInfo, { ProjectInfo } from '../getProjectInfo/index.mjs';
import generateClient from '../generateClient.mjs';
import locateSegments, { type Segment } from '../locateSegments.mjs';
import debounceWithArgs from '../utils/debounceWithArgs.mjs';
import formatLoggedSegmentName from '../utils/formatLoggedSegmentName.mjs';
import type { VovkDevEnv } from '../types.mjs';

export class VovkCLIWatcher {
  #projectInfo: ProjectInfo;

  #segments: Segment[] = [];

  #schemas: Record<string, VovkSchema> = {};

  #isWatching = false;

  #modulesWatcher: chokidar.FSWatcher | null = null;

  #segmentWatcher: chokidar.FSWatcher | null = null;

  #watchSegments = () => {
    const segmentReg = /\/?\[\[\.\.\.[a-zA-Z-_]+\]\]\/route.ts$/;
    const { cwd, log, config, apiDir } = this.#projectInfo;
    const schemaOutAbsolutePath = path.join(cwd, config.schemaOutDir);
    const apiDirAbsolutePath = path.join(cwd, apiDir);
    const getSegmentName = (filePath: string) => path.relative(apiDirAbsolutePath, filePath).replace(segmentReg, '');
    log.debug(`Watching segments at ${apiDirAbsolutePath}`);
    this.#segmentWatcher = chokidar
      .watch(apiDirAbsolutePath, {
        persistent: true,
        ignoreInitial: true,
      })
      .on('add', (filePath: string) => {
        log.debug(`File ${filePath} has been added to segments folder`);
        if (segmentReg.test(filePath)) {
          const segmentName = getSegmentName(filePath);

          this.#segments = this.#segments.find((s) => s.segmentName === segmentName)
            ? this.#segments
            : [...this.#segments, { routeFilePath: filePath, segmentName }];
          log.info(`${capitalize(formatLoggedSegmentName(segmentName))} has been added`);
          log.debug(`Full list of segments: ${this.#segments.map((s) => s.segmentName).join(', ')}`);

          void debouncedEnsureSchemaFiles(
            this.#projectInfo,
            schemaOutAbsolutePath,
            this.#segments.map((s) => s.segmentName)
          );
        }
      })
      .on('change', (filePath: string) => {
        log.debug(`File ${filePath} has been changed at segments folder`);
        if (segmentReg.test(filePath)) {
          void this.#requestSchema(getSegmentName(filePath));
        }
      })

      .on('addDir', async (dirPath: string) => {
        log.debug(`Directory ${dirPath} has been added to segments folder`);
        this.#segments = await locateSegments(apiDirAbsolutePath);
        for (const { segmentName } of this.#segments) {
          void this.#requestSchema(segmentName);
        }
      })

      .on('unlinkDir', async (dirPath: string) => {
        log.debug(`Directory ${dirPath} has been removed from segments folder`);
        this.#segments = await locateSegments(apiDirAbsolutePath);
        for (const { segmentName } of this.#segments) {
          void this.#requestSchema(segmentName);
        }
      })
      .on('unlink', (filePath: string) => {
        log.debug(`File ${filePath} has been removed from segments folder`);
        if (segmentReg.test(filePath)) {
          const segmentName = getSegmentName(filePath);
          this.#segments = this.#segments.filter((s) => s.segmentName !== segmentName);
          log.info(`${formatLoggedSegmentName(segmentName, { upperFirst: true })} has been removed`);
          log.debug(`Full list of segments: ${this.#segments.map((s) => s.segmentName).join(', ')}`);

          void debouncedEnsureSchemaFiles(
            this.#projectInfo,
            schemaOutAbsolutePath,
            this.#segments.map((s) => s.segmentName)
          );
        }
      })
      .on('ready', () => {
        log.debug('Segments watcher is ready');
      })
      .on('error', (error: Error) => {
        log.error(`Error watching segments folder: ${error?.message ?? 'Unknown error'}`);
      });
  };

  #watchModules = () => {
    const { config, cwd, log } = this.#projectInfo;
    const modulesDirAbsolutePath = path.join(cwd, config.modulesDir);
    log.debug(`Watching modules at ${modulesDirAbsolutePath}`);
    const processControllerChange = debounceWithArgs(this.#processControllerChange, 500);
    this.#modulesWatcher = chokidar
      .watch(modulesDirAbsolutePath, {
        persistent: true,
        ignoreInitial: true,
      })
      .on('add', (filePath: string) => {
        log.debug(`File ${filePath} has been added to modules folder`);
        void processControllerChange(filePath);
      })
      .on('change', (filePath: string) => {
        log.debug(`File ${filePath} has been changed at modules folder`);
        void processControllerChange(filePath);
      })
      .on('unlink', (filePath: string) => {
        log.debug(`File ${filePath} has been removed from modules folder`);
      })
      .on('addDir', () => {
        for (const { segmentName } of this.#segments) {
          void this.#requestSchema(segmentName);
        }
      })
      .on('unlinkDir', () => {
        for (const { segmentName } of this.#segments) {
          void this.#requestSchema(segmentName);
        }
      })
      .on('ready', () => {
        log.debug('Modules watcher is ready');
      })
      .on('error', (error: Error) => {
        log.error(`Error watching modules folder: ${error?.message ?? 'Unknown error'}`);
      });
  };

  #watchConfig = () => {
    const { log, cwd } = this.#projectInfo;
    log.debug(`Watching config files`);
    let isInitial = true;
    let isReady = false;

    const handle = debounce(async () => {
      this.#projectInfo = await getProjectInfo();
      if (!isInitial) {
        log.info('Config file has been updated');

        isInitial = false;
      }
      await this.#modulesWatcher?.close();
      await this.#segmentWatcher?.close();
      this.#watchModules();
      this.#watchSegments();
    }, 1000);

    chokidar
      .watch(['vovk.config.{js,mjs,cjs}', '.config/vovk.config.{js,mjs,cjs}'], {
        persistent: true,
        cwd,
        ignoreInitial: false,
        depth: 0,
      })
      .on('add', () => void handle())
      .on('change', () => void handle())
      .on('unlink', () => void handle())
      .on('ready', () => {
        if (isReady) return;
        // for some reason this watcher triggers ready event twice
        log.debug('Config files watcher is ready');
        isReady = true;
      })
      .on('error', (error: Error) => log.error(`Error watching config files: ${error?.message ?? 'Unknown error'}`));

    void handle();
  };

  async #watch() {
    if (this.#isWatching) throw new Error('Already watching');
    const { log } = this.#projectInfo;

    log.debug(
      `Starting segments and modules watcher. Detected initial segments: ${JSON.stringify(this.#segments.map((s) => s.segmentName))}.`
    );

    await ensureClient(this.#projectInfo);

    // automatically watches segments and modules
    this.#watchConfig();
  }

  #processControllerChange = async (filePath: string) => {
    const { log } = this.#projectInfo;
    const code = await fs.readFile(filePath, 'utf-8').catch(() => null);
    if (typeof code !== 'string') {
      log.error(`Error reading file ${filePath}`);
      return;
    }
    const nameOfClasReg = /\bclass\s+([A-Za-z_]\w*)(?:\s*<[^>]*>)?\s*\{/g;
    const namesOfClasses = [...code.matchAll(nameOfClasReg)].map((match) => match[1]);

    const importRegex = /import\s*{[^}]*\b(get|post|put|del|head|options|worker)\b[^}]*}\s*from\s*['"]vovk['"]/;
    if (importRegex.test(code) && namesOfClasses.length) {
      const affectedSegments = this.#segments.filter((s) => {
        const schema = this.#schemas[s.segmentName];
        if (!schema) return false;
        const controllersByOriginalName = keyBy(schema.controllers, '_originalControllerName');
        const workersByOriginalName = keyBy(schema.workers, '_originalWorkerName');

        return namesOfClasses.some(
          (name) =>
            schema.controllers[name] ||
            schema.workers[name] ||
            controllersByOriginalName[name] ||
            workersByOriginalName[name]
        );
      });

      if (affectedSegments.length) {
        log.debug(
          `A file with controller or worker ${namesOfClasses.join(', ')} have been modified at path "${filePath}". Segment(s) affected: ${JSON.stringify(affectedSegments.map((s) => s.segmentName))}`
        );

        for (const segment of affectedSegments) {
          await this.#requestSchema(segment.segmentName);
        }
      }
    } else {
      log.debug(`The file does not contain any controller or worker`);
    }
  };

  #requestSchema = debounceWithArgs(async (segmentName: string) => {
    const { apiEntryPoint, log, port, config } = this.#projectInfo;
    const { devHttps } = config;
    const endpoint = `${apiEntryPoint.startsWith(`http${devHttps ? 's' : ''}://`) ? apiEntryPoint : `http${devHttps ? 's' : ''}://localhost:${port}${apiEntryPoint}`}/${segmentName ? `${segmentName}/` : ''}_schema_`;

    log.debug(`Requesting schema for ${formatLoggedSegmentName(segmentName)} at ${endpoint}`);
    const resp = await fetch(endpoint);
    if (resp.status !== 200) {
      const probableCause = {
        404: 'The segment is not compiled.',
        500: 'Syntax error in one of controllers.',
      }[resp.status];
      log.warn(
        `Schema request to ${formatLoggedSegmentName(segmentName)} failed with status code ${resp.status} but expected 200.${probableCause ? ` Probable cause: ${probableCause}` : ''}`
      );
      return;
    }

    let schema: VovkSchema | null = null;
    try {
      ({ schema } = (await resp.json()) as { schema: VovkSchema | null });
    } catch (error) {
      log.error(`Error parsing schema for ${formatLoggedSegmentName(segmentName)}: ${(error as Error).message}`);
    }

    await this.#handleSchema(schema);
  }, 500);

  async #handleSchema(schema: VovkSchema | null) {
    const { log, config, cwd } = this.#projectInfo;
    if (!schema) {
      log.warn('Segment schema is null');
      return;
    }

    log.debug(`Handling received schema from ${formatLoggedSegmentName(schema.segmentName)}`);

    const schemaOutAbsolutePath = path.join(cwd, config.schemaOutDir);
    const segment = this.#segments.find((s) => s.segmentName === schema.segmentName);

    if (!segment) {
      log.warn(`Segment "${schema.segmentName}" not found`);
      return;
    }

    this.#schemas[schema.segmentName] = schema;
    if (schema.emitSchema) {
      const now = Date.now();
      const { diffResult } = await writeOneSchemaFile({
        schemaOutAbsolutePath,
        schema,
        skipIfExists: false,
      });

      const timeTook = Date.now() - now;

      if (diffResult) {
        logDiffResult(segment.segmentName, diffResult, this.#projectInfo);
        log.info(`Schema for ${formatLoggedSegmentName(segment.segmentName)} has been updated in ${timeTook}ms`);
      }
    } else if (schema && (!isEmpty(schema.controllers) || !isEmpty(schema.workers))) {
      log.error(
        `Non-empty schema provided for ${formatLoggedSegmentName(segment.segmentName)} but emitSchema is false`
      );
    }

    if (this.#segments.every((s) => this.#schemas[s.segmentName])) {
      log.debug(`All segments with "emitSchema" have schema.`);
      await generateClient(this.#projectInfo, this.#segments, this.#schemas);
    }
  }

  async start({ clientOutDir }: { clientOutDir?: string } = {}) {
    this.#projectInfo = await getProjectInfo({ clientOutDir });
    const { log, config, cwd, apiDir } = this.#projectInfo;

    if (config.devHttps) {
      const agent = new Agent({
        connect: {
          rejectUnauthorized: false,
        },
      });

      setGlobalDispatcher(agent);
    }

    process.on('uncaughtException', (err) => {
      log.error(`Uncaught Exception: ${err.message}`);
    });

    process.on('unhandledRejection', (reason) => {
      log.error(`Unhandled Rejection: ${String(reason)}`);
    });

    const apiDirAbsolutePath = path.join(cwd, apiDir);
    const schemaOutAbsolutePath = path.join(cwd, config.schemaOutDir);

    this.#segments = await locateSegments(apiDirAbsolutePath);

    await debouncedEnsureSchemaFiles(
      this.#projectInfo,
      schemaOutAbsolutePath,
      this.#segments.map((s) => s.segmentName)
    );

    // Request schema every segment in 5 seconds in order to update schema and start watching
    setTimeout(() => {
      for (const { segmentName } of this.#segments) {
        void this.#requestSchema(segmentName);
      }
      this.#watch();
    }, 5000);
  }
}
const env = process.env as VovkDevEnv;
if (env.__VOVK_START_WATCHER_IN_STANDALONE_MODE__ === 'true') {
  void new VovkCLIWatcher().start();
}
