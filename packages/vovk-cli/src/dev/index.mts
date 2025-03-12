import fs from 'node:fs/promises';
import path from 'node:path';
import type { VovkEnv, VovkFullSchema, VovkSegmentSchema } from 'vovk';
import * as chokidar from 'chokidar';
import { Agent, setGlobalDispatcher } from 'undici';
import keyBy from 'lodash/keyBy.js';
import capitalize from 'lodash/capitalize.js';
import debounce from 'lodash/debounce.js';
import once from 'lodash/once.js';
import ensureSchemaFiles, { debouncedEnsureSchemaFiles } from './ensureSchemaFiles.mjs';
import writeOneSegmentSchemaFile from './writeOneSegmentSchemaFile.mjs';
import logDiffResult from './logDiffResult.mjs';
import ensureClient from '../generate/ensureClient.mjs';
import getProjectInfo, { ProjectInfo } from '../getProjectInfo/index.mjs';
import generate from '../generate/index.mjs';
import locateSegments from '../locateSegments.mjs';
import debounceWithArgs from '../utils/debounceWithArgs.mjs';
import formatLoggedSegmentName from '../utils/formatLoggedSegmentName.mjs';
import isSegmentSchemaEmpty from './isSegmentSchemaEmpty.mjs';
import writeConfigJson from './writeConfigJson.mjs';

export class VovkDev {
  #projectInfo: ProjectInfo;

  #fullSchema: VovkFullSchema = {
    segments: {},
    config: {},
  };

  #isWatching = false;

  #modulesWatcher: chokidar.FSWatcher | null = null;

  #segmentWatcher: chokidar.FSWatcher | null = null;

  #onFirstTimeGenerate: (() => void) | null = null;

  #watchSegments = (callback: () => void) => {
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

          this.#projectInfo.segments = this.#projectInfo.segments.find((s) => s.segmentName === segmentName)
            ? this.#projectInfo.segments
            : [
                ...this.#projectInfo.segments,
                {
                  routeFilePath: filePath,
                  segmentName,
                  segmentImportPath: path.relative(config.clientOutDir, filePath), // TODO DRY locateSegments
                },
              ];
          log.info(`${capitalize(formatLoggedSegmentName(segmentName))} has been added`);
          log.debug(`Full list of segments: ${this.#projectInfo.segments.map((s) => s.segmentName).join(', ')}`);

          void debouncedEnsureSchemaFiles(
            this.#projectInfo,
            schemaOutAbsolutePath,
            this.#projectInfo.segments.map((s) => s.segmentName)
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
        this.#projectInfo.segments = await locateSegments({ dir: apiDirAbsolutePath, config });
        for (const { segmentName } of this.#projectInfo.segments) {
          void this.#requestSchema(segmentName);
        }
      })

      .on('unlinkDir', async (dirPath: string) => {
        log.debug(`Directory ${dirPath} has been removed from segments folder`);
        this.#projectInfo.segments = await locateSegments({ dir: apiDirAbsolutePath, config });
        for (const { segmentName } of this.#projectInfo.segments) {
          void this.#requestSchema(segmentName);
        }
      })
      .on('unlink', (filePath: string) => {
        log.debug(`File ${filePath} has been removed from segments folder`);
        if (segmentReg.test(filePath)) {
          const segmentName = getSegmentName(filePath);
          this.#projectInfo.segments = this.#projectInfo.segments.filter((s) => s.segmentName !== segmentName);
          log.info(`${formatLoggedSegmentName(segmentName, { upperFirst: true })} has been removed`);
          log.debug(`Full list of segments: ${this.#projectInfo.segments.map((s) => s.segmentName).join(', ')}`);

          void debouncedEnsureSchemaFiles(
            this.#projectInfo,
            schemaOutAbsolutePath,
            this.#projectInfo.segments.map((s) => s.segmentName)
          );
        }
      })
      .on('ready', () => {
        callback();
        log.debug('Segments watcher is ready');
      })
      .on('error', (error) => {
        log.error(`Error watching segments folder: ${(error as Error)?.message ?? 'Unknown error'}`);
      });
  };

  #watchModules = (callback: () => void) => {
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
        for (const { segmentName } of this.#projectInfo.segments) {
          void this.#requestSchema(segmentName);
        }
      })
      .on('unlinkDir', () => {
        for (const { segmentName } of this.#projectInfo.segments) {
          void this.#requestSchema(segmentName);
        }
      })
      .on('ready', () => {
        callback();
        log.debug('Modules watcher is ready');
      })
      .on('error', (error) => {
        log.error(`Error watching modules folder: ${(error as Error)?.message ?? 'Unknown error'}`);
      });
  };

  #watchConfig = (callback: () => void) => {
    const { log, cwd } = this.#projectInfo;
    log.debug(`Watching config files`);
    let isInitial = true;
    let isReady = false;

    const handle = debounce(async () => {
      this.#projectInfo = await getProjectInfo();
      await this.#modulesWatcher?.close();
      await this.#segmentWatcher?.close();

      await Promise.all([
        new Promise((resolve) => this.#watchModules(() => resolve(0))),
        new Promise((resolve) => this.#watchSegments(() => resolve(0))),
      ]);

      const schemaOutAbsolutePath = path.join(cwd, this.#projectInfo.config.schemaOutDir);

      if (isInitial) {
        callback();
      } else {
        log.info('Config file has been updated');
        this.#generate();
      }

      await writeConfigJson(schemaOutAbsolutePath, this.#projectInfo);

      isInitial = false;
    }, 1000);

    chokidar
      // .watch(['vovk.config.{js,mjs,cjs}', '.config/vovk.config.{js,mjs,cjs}'], {
      .watch(
        [
          'vovk.config.js',
          'vovk.config.mjs',
          'vovk.config.cjs',
          '.config/vovk.config.js',
          '.config/vovk.config.mjs',
          '.config/vovk.config.cjs',
        ],
        {
          persistent: true,
          cwd,
          ignoreInitial: false,
          depth: 0,
        }
      )
      .on('add', () => void handle())
      .on('change', () => void handle())
      .on('unlink', () => void handle())
      .on('ready', () => {
        if (isReady) return;
        // for some reason this watcher triggers ready event twice
        log.debug('Config files watcher is ready');
        isReady = true;
      })
      .on('error', (error) =>
        log.error(`Error watching config files: ${(error as Error)?.message ?? 'Unknown error'}`)
      );

    void handle();
  };

  async #watch(callback: () => void) {
    if (this.#isWatching) throw new Error('Already watching');
    const { log } = this.#projectInfo;

    log.debug(
      `Starting segments and modules watcher. Detected initial segments: ${JSON.stringify(this.#projectInfo.segments.map((s) => s.segmentName))}.`
    );

    // automatically watches segments and modules
    this.#watchConfig(callback);
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

    const importRegex = /import\s*{[^}]*\b(get|post|put|del|head|options)\b[^}]*}\s*from\s*['"]vovk['"]/;
    if (importRegex.test(code) && namesOfClasses.length) {
      const affectedSegments = this.#projectInfo.segments.filter((s) => {
        const segmentSchema = this.#fullSchema.segments[s.segmentName];
        if (!segmentSchema) return false;
        const controllersByOriginalName = keyBy(
          segmentSchema.controllers,
          'originalControllerName' satisfies keyof VovkSegmentSchema['controllers'][string]
        );

        return namesOfClasses.some((name) => segmentSchema.controllers[name] || controllersByOriginalName[name]);
      });

      if (affectedSegments.length) {
        log.debug(
          `A file with controller ${namesOfClasses.join(', ')} have been modified at path "${filePath}". Segment(s) affected: ${JSON.stringify(affectedSegments.map((s) => s.segmentName))}`
        );

        for (const segment of affectedSegments) {
          await this.#requestSchema(segment.segmentName);
        }
      } else {
        log.debug(`The class ${namesOfClasses.join(', ')} does not belong to any segment`);
      }
    } else {
      log.debug(`The file ${filePath} does not contain any controller`);
    }
  };

  #requestSchema = debounceWithArgs(async (segmentName: string) => {
    const { apiRoot, log, port, config } = this.#projectInfo;
    const { devHttps } = config;
    const endpoint = `${apiRoot.startsWith(`http${devHttps ? 's' : ''}://`) ? apiRoot : `http${devHttps ? 's' : ''}://localhost:${port}${apiRoot}`}/${segmentName ? `${segmentName}/` : ''}_schema_`;

    log.debug(`Requesting schema for ${formatLoggedSegmentName(segmentName)} at ${endpoint}`);

    try {
      const resp = await fetch(endpoint);

      if (resp.status !== 200) {
        const probableCause = {
          404: 'The segment did not compile or config.origin is wrong.',
        }[resp.status];
        log.warn(
          `Schema request to ${formatLoggedSegmentName(segmentName)} failed with status code ${resp.status} but expected 200.${probableCause ? ` Probable cause: ${probableCause}` : ''}`
        );
        return { isError: true };
      }

      let segmentSchema: VovkSegmentSchema | null = null;
      try {
        ({ schema: segmentSchema } = (await resp.json()) as { schema: VovkSegmentSchema | null });
      } catch (error) {
        log.error(`Error parsing schema for ${formatLoggedSegmentName(segmentName)}: ${(error as Error).message}`);
      }

      await this.#handleSegmentSchema(segmentName, segmentSchema);
    } catch (error) {
      log.error(
        `Error requesting schema for ${formatLoggedSegmentName(segmentName)} at ${endpoint}: ${(error as Error).message}`
      );

      return { isError: true };
    }

    return { isError: false };
  }, 500);

  #generate = debounce(
    () => generate({ projectInfo: this.#projectInfo, fullSchema: this.#fullSchema }).then(this.#onFirstTimeGenerate),
    1000
  );

  async #handleSegmentSchema(segmentName: string, segmentSchema: VovkSegmentSchema | null) {
    const { log, config, cwd } = this.#projectInfo;
    if (!segmentSchema) {
      log.warn(`${formatLoggedSegmentName(segmentName)} schema is null`);
      return;
    }

    log.debug(`Handling received schema from ${formatLoggedSegmentName(segmentName)}`);

    const schemaOutAbsolutePath = path.join(cwd, config.schemaOutDir);
    const segment = this.#projectInfo.segments.find((s) => s.segmentName === segmentName);

    if (!segment) {
      log.warn(`${formatLoggedSegmentName(segmentName)} not found`);
      return;
    }

    this.#fullSchema.segments[segmentName] = segmentSchema;
    if (segmentSchema.emitSchema) {
      const now = Date.now();
      const { diffResult } = await writeOneSegmentSchemaFile({
        schemaOutAbsolutePath,
        segmentSchema,
        skipIfExists: false,
      });

      const timeTook = Date.now() - now;

      if (diffResult) {
        logDiffResult(segment.segmentName, diffResult, this.#projectInfo);
        log.info(`Schema for ${formatLoggedSegmentName(segment.segmentName)} has been updated in ${timeTook}ms`);
      }
    } else if (segmentSchema && !isSegmentSchemaEmpty(segmentSchema)) {
      log.error(
        `Non-empty schema provided for ${formatLoggedSegmentName(segment.segmentName)} but "emitSchema" is false`
      );
    }

    if (this.#projectInfo.segments.every((s) => this.#fullSchema.segments[s.segmentName])) {
      log.debug(`All segments with "emitSchema" have schema.`);
      this.#generate();
    }
  }

  async start({ exit }: { exit: boolean }) {
    const now = Date.now();
    this.#projectInfo = await getProjectInfo();
    const { log, config, cwd } = this.#projectInfo;
    log.info('Starting...');

    if (exit) {
      this.#onFirstTimeGenerate = once(() => {
        log.info('The schemas and the RPC client have been generated. Exiting...');
      });
    }

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

    const schemaOutAbsolutePath = path.join(cwd, config.schemaOutDir);

    await ensureSchemaFiles(
      this.#projectInfo,
      schemaOutAbsolutePath,
      this.#projectInfo.segments.map((s) => s.segmentName)
    );

    await ensureClient(this.#projectInfo);

    const MAX_ATTEMPTS = 5;
    const DELAY = 5000;

    // Request schema every segment in 5 seconds in order to update schema on start
    setTimeout(() => {
      for (const { segmentName } of this.#projectInfo.segments) {
        let attempts = 0;
        void this.#requestSchema(segmentName).then(({ isError }) => {
          if (isError) {
            const interval = setInterval(() => {
              attempts++;
              if (attempts >= MAX_ATTEMPTS) {
                clearInterval(interval);
                log.error(
                  `Failed to request schema for ${formatLoggedSegmentName(segmentName)} after ${MAX_ATTEMPTS} attempts`
                );
                return;
              }
              void this.#requestSchema(segmentName).then(({ isError: isError2 }) => {
                if (!isError2) {
                  clearInterval(interval);
                  log.info(`Requested schema for ${formatLoggedSegmentName(segmentName)} after ${attempts} attempts`);
                }
              });
            }, DELAY);
          }
        });
      }
    }, DELAY);

    if (!exit) {
      this.#watch(() => {
        log.info(`Ready in ${Date.now() - now}ms. Making initial requests for schemas in a moment...`);
      });
    } else {
      log.info(`Ready in ${Date.now() - now}ms. Making requests for schemas in a moment...`);
    }
  }
}
const env = process.env as VovkEnv;
if (env.__VOVK_START_WATCHER_IN_STANDALONE_MODE__ === 'true') {
  void new VovkDev().start({ exit: env.__VOVK_EXIT__ === 'true' });
}
