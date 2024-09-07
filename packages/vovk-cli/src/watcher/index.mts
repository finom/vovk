import * as chokidar from 'chokidar';
import fs from 'fs/promises';
import getProjectInfo, { ProjectInfo } from '../getProjectInfo/index.mjs';
import path from 'path';
import { debouncedEnsureSchemaFiles } from './ensureSchemaFiles.mjs';
import writeOneSchemaFile from './writeOneSchemaFile.mjs';
import logDiffResult from './logDiffResult.mjs';
import generateClient from '../generateClient.mjs';
import locateSegments, { type Segment } from '../locateSegments.mjs';
import debounceWithArgs from '../utils/debounceWithArgs.mjs';
import debounce from 'lodash/debounce.js';
import isEmpty from 'lodash/isEmpty.js';
import { VovkEnv } from '../types.mjs';
import { VovkSchema } from 'vovk';
import formatLoggedSegmentName from '../utils/formatLoggedSegmentName.mjs';
import keyBy from 'lodash/keyBy.js';

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
    const schemaOutFullPath = path.join(cwd, config.schemaOutDir);
    const apiDirFullPath = path.join(cwd, apiDir);
    const getSegmentName = (filePath: string) => path.relative(apiDirFullPath, filePath).replace(segmentReg, '');
    log.debug(`Watching segments in ${apiDirFullPath}`);
    this.#segmentWatcher = chokidar
      .watch(apiDirFullPath, {
        persistent: true,
        ignoreInitial: true,
      })
      .on('add', (filePath) => {
        log.debug(`File ${filePath} has been added to segments folder`);
        if (segmentReg.test(filePath)) {
          const segmentName = getSegmentName(filePath);

          this.#segments = this.#segments.find((s) => s.segmentName === segmentName)
            ? this.#segments
            : [...this.#segments, { routeFilePath: filePath, segmentName }];
          log.info(`Segment "${segmentName}" has been added`);
          log.debug(`Full list of segments: ${this.#segments.map((s) => s.segmentName).join(', ')}`);

          void debouncedEnsureSchemaFiles(
            schemaOutFullPath,
            this.#segments.map((s) => s.segmentName),
            this.#projectInfo // TODO refactor
          );
        }
      })
      .on('change', (filePath) => {
        log.debug(`File ${filePath} has been changed at segments folder`);
        if (segmentReg.test(filePath)) {
          void this.#requestSchema(getSegmentName(filePath));
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      .on('addDir', async (dirPath) => {
        log.debug(`Directory ${dirPath} has been added to segments folder`);
        this.#segments = await locateSegments(apiDirFullPath);
        for (const { segmentName } of this.#segments) {
          void this.#requestSchema(segmentName);
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      .on('unlinkDir', async (dirPath) => {
        log.debug(`Directory ${dirPath} has been removed from segments folder`);
        this.#segments = await locateSegments(apiDirFullPath);
        for (const { segmentName } of this.#segments) {
          void this.#requestSchema(segmentName);
        }
      })
      .on('unlink', (filePath) => {
        log.debug(`File ${filePath} has been removed from segments folder`);
        if (segmentReg.test(filePath)) {
          const segmentName = getSegmentName(filePath);
          this.#segments = this.#segments.filter((s) => s.segmentName !== segmentName);
          log.info(`Segment "${segmentName}" has been removed`);
          log.debug(`Full list of segments: ${this.#segments.map((s) => s.segmentName).join(', ')}`);

          void debouncedEnsureSchemaFiles(
            schemaOutFullPath,
            this.#segments.map((s) => s.segmentName),
            this.#projectInfo // TODO refactor
          );
        }
      })
      .on('ready', () => {
        log.debug('Segments watcher is ready');
      })
      .on('error', (error) => {
        log.error(`Error watching segments folder: ${error.message}`);
      });
  };

  #watchModules = () => {
    const { config, cwd, log } = this.#projectInfo;
    const modulesDirFullPath = path.join(cwd, config.modulesDir);
    log.debug(`Watching modules in ${modulesDirFullPath}`);
    this.#modulesWatcher = chokidar
      .watch(modulesDirFullPath, {
        persistent: true,
        ignoreInitial: true,
      })
      .on('add', (filePath) => {
        log.debug(`File ${filePath} has been added to modules folder`);
        void this.#processControllerChange(filePath);
      })
      .on('change', (filePath) => {
        log.debug(`File ${filePath} has been changed at modules folder`);
        void this.#processControllerChange(filePath);
      })
      .on('unlink', (filePath) => {
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
      .on('error', (error) => {
        log.error(`Error watching modules folder: ${error.message}`);
      });
  };

  #watchConfig = () => {
    const { log, cwd } = this.#projectInfo;
    log.debug(`Watching config files`);
    let isInitial = true;
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
      .watch('vovk.config.{js,mjs,cjs}', {
        persistent: true,
        cwd,
        ignoreInitial: false,
        depth: 0,
      })
      .on('add', () => void handle())
      .on('change', () => void handle())
      .on('unlink', () => void handle())
      .on('ready', () => {
        log.debug('Config files watcher is ready');
      })
      .on('error', (error) => {
        log.error(`Error watching config files: ${error.message}`);
      });
  };

  #watch() {
    if (this.#isWatching) throw new Error('Already watching');
    const { log } = this.#projectInfo;

    log.debug(
      `Starting segments and modules watcher. Detected initial segments: ${JSON.stringify(this.#segments.map((s) => s.segmentName))}.`
    );

    // automatically watches segments and modules
    this.#watchConfig();
  }

  #processControllerChange = async (filePath: string) => {
    const { log } = this.#projectInfo;
    const code = await fs.readFile(filePath, 'utf-8').catch(() => null);
    if (typeof code !== 'string') return;
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
          `A file with controller or worker ${namesOfClasses.join(', ')} have been modified at path "${filePath}". Segment(s) affected: ${affectedSegments.map((s) => s.segmentName).join(', ')}`
        );

        for (const segment of affectedSegments) {
          await this.#requestSchema(segment.segmentName);
        }
      }
    }
  };

  #requestSchema = debounceWithArgs(async (segmentName: string) => {
    const { apiEntryPoint, log, port } = this.#projectInfo;
    const endpoint = `${apiEntryPoint.startsWith('http') ? apiEntryPoint : `http://localhost:${port}${apiEntryPoint}`}/${segmentName ? `${segmentName}/` : ''}_schema_`;

    log.debug(`Requesting schema for ${formatLoggedSegmentName(segmentName, true)} at ${endpoint}`);
    const resp = await fetch(endpoint);
    if (resp.status !== 200) {
      log.warn(
        `Schema request to ${formatLoggedSegmentName(segmentName, true)} failed with status code ${resp.status}. Expected 200.`
      );
      return;
    }

    let schema: VovkSchema | null = null;
    try {
      ({ schema } = (await resp.json()) as { schema: VovkSchema | null });
    } catch (error) {
      log.error(`Error parsing schema for ${formatLoggedSegmentName(segmentName, true)}: ${(error as Error).message}`);
    }

    await this.#handleSchema(schema);
  }, 500);

  async #handleSchema(schema: VovkSchema | null) {
    const { log, config, cwd } = this.#projectInfo;
    log.debug(`Handling received schema`);
    if (!schema) {
      log.warn('Segment schema is null');
      return;
    }

    const schemaOutFullPath = path.join(cwd, config.schemaOutDir);
    const segment = this.#segments.find((s) => s.segmentName === schema.segmentName);

    if (!segment) {
      log.warn(`Segment "${schema.segmentName}" not found`);
      return;
    }

    this.#schemas[schema.segmentName] = schema;
    if (schema.emitSchema) {
      const now = Date.now();
      const { diffResult } = await writeOneSchemaFile({
        schemaOutFullPath,
        schema,
        skipIfExists: false,
      });

      const timeTook = Date.now() - now;

      if (diffResult) {
        logDiffResult(segment.segmentName, diffResult, this.#projectInfo);
        log.info(`Schema for ${formatLoggedSegmentName(segment.segmentName, true)} has been updated in ${timeTook}ms`);
      }
    } else if (schema && (!isEmpty(schema.controllers) || !isEmpty(schema.workers))) {
      log.error(
        `Non-empty schema provided for ${formatLoggedSegmentName(segment.segmentName, true)} but emitSchema is false`
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

    process.on('uncaughtException', (err) => {
      log.error(`Uncaught Exception: ${err.message}`);
    });

    process.on('unhandledRejection', (reason) => {
      log.error(`Unhandled Rejection: ${String(reason)}`);
    });

    const apiDirFullPath = path.join(cwd, apiDir);
    const schemaOutFullPath = path.join(cwd, config.schemaOutDir);

    this.#segments = await locateSegments(apiDirFullPath);

    await debouncedEnsureSchemaFiles(
      schemaOutFullPath,
      this.#segments.map((s) => s.segmentName),
      this.#projectInfo
    );

    // Request schema every segment in 3 seconds in order to update schema and start watching
    setTimeout(() => {
      for (const { segmentName } of this.#segments) {
        void this.#requestSchema(segmentName);
      }
      this.#watch();
    }, 3000);
  }
}
const env = process.env as VovkEnv;
if (env.__VOVK_START_WATCHER_IN_STANDALONE_MODE__ === 'true') {
  void new VovkCLIWatcher().start();
}
