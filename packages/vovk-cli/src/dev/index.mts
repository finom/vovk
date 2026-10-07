import fs from 'node:fs/promises';
import path from 'node:path';
import * as chokidar from 'chokidar';
import capitalize from 'lodash/capitalize.js';
import debounce from 'lodash/debounce.js';
import isEmpty from 'lodash/isEmpty.js';
import keyBy from 'lodash/keyBy.js';
import once from 'lodash/once.js';
import type { LogLevelNames } from 'loglevel';
import { Agent, fetch } from 'undici';
import type { VovkSchema } from 'vovk';
import { VovkSchemaIdEnum, type VovkSegmentSchema } from 'vovk/internal';
import { ensureClient } from '../generate/ensure-client.mjs';
import { generate } from '../generate/generate.mjs';
import { CONFIG_FILE_PATHS } from '../get-project-info/get-config/get-config-absolute-paths.mjs';
import { getMetaSchema } from '../get-project-info/get-meta-schema.mjs';
import { getProjectInfo, loadOpenAPIMixins, type ProjectInfo } from '../get-project-info/index.mjs';
import type { DevOptions, VovkEnv } from '../types.mjs';
import { chalkHighlightThing } from '../utils/chalk-highlight-thing.mjs';
import { debounceWithArgs } from '../utils/debounce-with-args.mjs';
import { formatLoggedSegmentName } from '../utils/format-logged-segment-name.mjs';
import { locateSegments, type Segment } from '../utils/locate-segments.mjs';
import { oneAtATime } from '../utils/one-at-a-time.mjs';
import { toPosixPath } from '../utils/to-import-path.mjs';
import { watchFolder } from '../utils/watch-folder.mjs';
import { ensureSchemaFiles, getPlaceholderSchema } from './ensure-schema-files.mjs';
import { logDiffResult } from './log-diff-result.mjs';
import { writeMetaJson } from './write-meta-json.mjs';
import {
  assertSegmentName,
  ROOT_SEGMENT_FILE_NAME,
  writeOneSegmentSchemaFile,
} from './write-one-segment-schema-file.mjs';

// chokidar reports native paths, so both separators are accepted
export const SEGMENT_ROUTE_FILE_REGEX = /[\\/]?\[\[\.\.\.[a-zA-Z-_]+\]\][\\/]route\.ts$/;

export function getSegmentNameFromRouteFile(relativeRouteFilePath: string) {
  return toPosixPath(relativeRouteFilePath).replace(SEGMENT_ROUTE_FILE_REGEX, '');
}

// the schema always comes from the local dev server, outputConfig.origin only applies to the generated client
export function getSchemaEndpoint({
  port,
  rootEntry,
  devHttps,
  segmentName,
}: {
  port: string;
  rootEntry: string;
  devHttps: boolean;
  segmentName: string;
}) {
  return `http${devHttps ? 's' : ''}://localhost:${port}/${rootEntry}/${segmentName ? `${segmentName}/` : ''}_schema_`;
}

// a file that imports an HTTP decorator from vovk may hold a controller, the segment schemas tell which
export function getControllerClassNames(code: string) {
  const httpDecoratorImport = /import\s*{[^}]*\b(get|post|put|patch|del|head|options)\b[^}]*}\s*from\s*['"]vovk['"]/;
  if (!httpDecoratorImport.test(code)) return [];
  return [...code.matchAll(/\bclass\s+([A-Za-z_$][\w$]*)/g)].map((match) => match[1]);
}

export class VovkDev {
  #projectInfo!: ProjectInfo;

  #segments: Segment[] = [];

  #schemaSegments: VovkSchema['segments'] = {};

  #isWatching = false;

  #modulesWatcher: chokidar.FSWatcher | null = null;

  #segmentWatcher: chokidar.FSWatcher | null = null;

  #onFirstTimeGenerate: (() => void) | null = null;

  // with --exit a failure ends the run with code 1, a watching run waits for the next change instead
  #exit = false;

  #schemaOut: string | null = null;

  #devHttps: boolean | null;

  #logLevel: LogLevelNames;

  // accepts the self-signed certificate of next dev --experimental-https; used for the schema requests only
  #selfSignedDispatcher: Agent | null = null;

  // a 404 comes back on every attempt, so it's reported once per URL
  #notFoundEndpoints = new Set<string>();

  // requested again on the next change in a watched folder, the fix can be in any file
  #failedSegmentNames = new Set<string>();

  constructor({ schemaOut, devHttps, logLevel }: Pick<DevOptions, 'schemaOut' | 'devHttps' | 'logLevel'>) {
    this.#schemaOut = schemaOut || null;
    // null when the flag is omitted so config.devHttps can take effect
    this.#devHttps = devHttps ?? null;
    this.#logLevel = logLevel || 'info';
  }

  // the client imports the schema from --schema-out when it's given
  #getCliSchemaPath() {
    return this.#schemaOut ? path.resolve(this.#projectInfo.cwd, this.#schemaOut) : undefined;
  }

  #getSchemaOutAbsolutePath() {
    return path.resolve(this.#projectInfo.cwd, this.#schemaOut ?? this.#projectInfo.config.schemaOutDir);
  }

  #watchSegments = (callback: () => void) => {
    const { log, apiDirAbsolutePath } = this.#projectInfo;
    if (!apiDirAbsolutePath) {
      throw new Error('Unable to watch segments. It looks like CWD is not a Next.js app.');
    }
    const getSegmentName = (filePath: string) =>
      getSegmentNameFromRouteFile(path.relative(apiDirAbsolutePath, filePath));
    log.debug(`Watching segments at ${apiDirAbsolutePath}`);
    this.#segmentWatcher = watchFolder(apiDirAbsolutePath, {
      persistent: true,
      ignoreInitial: true,
    })
      .on('add', (filePath: string) => {
        log.debug(`File ${filePath} has been added to segments folder`);
        if (SEGMENT_ROUTE_FILE_REGEX.test(filePath)) {
          const segmentName = getSegmentName(filePath);
          try {
            assertSegmentName(segmentName, path.dirname(path.dirname(filePath)));
          } catch (error) {
            log.error((error as Error).message);
            return;
          }

          this.#segments = this.#segments.find((s) => s.segmentName === segmentName)
            ? this.#segments
            : [
                ...this.#segments,
                {
                  routeFilePath: filePath,
                  segmentName,
                },
              ];
          log.info(`${capitalize(formatLoggedSegmentName(segmentName))} has been added`);
          log.debug(`Full list of segments: ${this.#segments.map((s) => s.segmentName).join(', ')}`);
          void this.#requestSchema(segmentName);
          this.#cleanUpSchemaFiles();
        }
      })
      .on('change', (filePath: string) => {
        log.debug(`File ${filePath} has been changed at segments folder`);
        if (SEGMENT_ROUTE_FILE_REGEX.test(filePath)) {
          void this.#requestSchema(getSegmentName(filePath));
        }
      })

      .on('addDir', async (dirPath: string) => {
        log.debug(`Directory ${dirPath} has been added to segments folder`);
        this.#cleanUpSchemaFiles();
        await this.#locateSegments();
        for (const { segmentName } of this.#segments) {
          void this.#requestSchema(segmentName);
        }
      })

      .on('unlinkDir', async (dirPath: string) => {
        log.debug(`Directory ${dirPath} has been removed from segments folder`);
        this.#cleanUpSchemaFiles();
        await this.#locateSegments();
        for (const { segmentName } of this.#segments) {
          void this.#requestSchema(segmentName);
        }
      })
      .on('unlink', (filePath: string) => {
        log.debug(`File ${filePath} has been removed from segments folder`);
        if (SEGMENT_ROUTE_FILE_REGEX.test(filePath)) {
          const segmentName = getSegmentName(filePath);
          this.#segments = this.#segments.filter((s) => s.segmentName !== segmentName);
          log.info(`${formatLoggedSegmentName(segmentName, { upperFirst: true })} has been removed`);
          log.debug(`Full list of segments: ${this.#segments.map((s) => s.segmentName).join(', ')}`);
          this.#dropRemovedSegments();
          this.#cleanUpSchemaFiles();
        }
      })
      .on('all', () => this.#requestFailedSchemas())
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
    const modulesDirAbsolutePath = path.resolve(cwd, config.modulesDir);
    log.debug(`Watching modules at ${modulesDirAbsolutePath}`);
    const processControllerChange = debounceWithArgs(this.#processControllerChange, 500);
    this.#modulesWatcher = watchFolder(modulesDirAbsolutePath, {
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
      .on('all', () => this.#requestFailedSchemas())
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
      this.#projectInfo = await getProjectInfo({ logLevel: this.#logLevel });
      await this.#locateSegments();
      await this.#modulesWatcher?.close();
      await this.#segmentWatcher?.close();

      await Promise.all([
        new Promise((resolve) => this.#watchModules(() => resolve(0))),
        new Promise((resolve) => this.#watchSegments(() => resolve(0))),
      ]);

      if (isInitial) {
        callback();
        if (!this.#segments.length) {
          log.info(
            `No segments found. Create a root segment with ${chalkHighlightThing('npx vovk new segment')} command`
          );
        }
      } else {
        log.info('Config file has been updated');
        this.#generate();
      }

      await this.#writeMissingSchemaFiles();

      isInitial = false;
    }, 1000);

    chokidar
      // package.json gives the generated packages their name, version and other fields
      .watch([...CONFIG_FILE_PATHS, 'package.json'], {
        persistent: true,
        cwd,
        ignoreInitial: false,
        depth: 0,
      })
      .on('add', () => void handle())
      .on('change', () => void handle())
      .on('unlink', () => void handle())
      .on('ready', () => {
        // this watcher fires ready twice
        if (isReady) return;
        log.debug('Config files watcher is ready');
        isReady = true;
      })
      .on('error', (error) =>
        log.error(`Error watching config files: ${(error as Error)?.message ?? 'Unknown error'}`)
      );

    void handle();
  };

  // a git checkout can drop or reorder watcher events, so the segments are read from disk when it runs
  #cleanUpSchemaFiles = debounce(async () => {
    await this.#locateSegments();
    for (const { segmentName } of this.#segments) {
      if (!this.#schemaSegments[segmentName]) void this.#requestSchema(segmentName);
    }
    try {
      const segmentNames = this.#segments.map((s) => s.segmentName);
      await ensureSchemaFiles(this.#projectInfo, this.#getSchemaOutAbsolutePath(), segmentNames);
    } catch (error) {
      this.#projectInfo.log.error(`Failed to update the schema files: ${(error as Error)?.message ?? error}`);
    }
  }, 1000);

  // a folder renamed to "root" while the watcher runs is reported, the watcher keeps the segments it knows
  async #locateSegments() {
    const { log, config, apiDirAbsolutePath } = this.#projectInfo;
    try {
      this.#segments = await locateSegments({ dir: apiDirAbsolutePath, config, log });
    } catch (error) {
      log.error((error as Error).message);
    }
    this.#dropRemovedSegments();
  }

  // a removed or renamed segment leaves the generated client
  #dropRemovedSegments() {
    const removedNames = Object.keys(this.#schemaSegments).filter(
      (name) => !this.#segments.some((s) => s.segmentName === name)
    );
    for (const name of removedNames) {
      delete this.#schemaSegments[name];
    }
    if (removedNames.length) {
      this.#generateIfComplete();
    }
  }

  // a client generated before every segment sent its schema would lack the others
  #generateIfComplete() {
    if (this.#segments.every((s) => this.#schemaSegments[s.segmentName])) {
      this.#projectInfo.log.debug(`All segments with "emitSchema" have schema.`);
      this.#generate();
    }
  }

  async #watch(callback: () => void) {
    if (this.#isWatching) throw new Error('Already watching');
    const { log } = this.#projectInfo;

    log.debug(
      `Starting segments and modules watcher. Detected initial segments: ${JSON.stringify(this.#segments.map((s) => s.segmentName))}.`
    );

    // also watches segments and modules
    this.#watchConfig(callback);
  }

  #processControllerChange = async (filePath: string) => {
    const { log } = this.#projectInfo;
    const code = await fs.readFile(filePath, 'utf-8').catch(() => null);
    if (typeof code !== 'string') {
      log.error(`Error reading file ${filePath}`);
      return;
    }
    const namesOfClasses = getControllerClassNames(code);
    const affectedSegments = this.#segments.filter((s) => {
      const segmentSchema = this.#schemaSegments[s.segmentName];
      if (!segmentSchema || !namesOfClasses.length) return false;
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

      await Promise.all(affectedSegments.map((segment) => this.#requestSchema(segment.segmentName)));
      return;
    }

    // a renamed controller, a service or a validation module can change any schema
    log.debug(`The file ${filePath} holds no controller of a known segment, requesting every segment`);
    await Promise.all(this.#segments.map((segment) => this.#requestSchema(segment.segmentName)));
  };

  #getSelfSignedDispatcher() {
    this.#selfSignedDispatcher ??= new Agent({ connect: { rejectUnauthorized: false } });
    return this.#selfSignedDispatcher;
  }

  #requestSchema = debounceWithArgs(async (segmentName: string) => {
    const result = await this.#fetchSchema(segmentName);
    if (result.isError || result.isRefused) {
      this.#failedSegmentNames.add(segmentName);
      await this.#useLastKnownSchema(segmentName);
    } else {
      this.#failedSegmentNames.delete(segmentName);
    }
    return result;
  }, 500);

  // a segment without a schema would hold back the client of the others; --exit generates from fresh schemas only
  async #useLastKnownSchema(segmentName: string) {
    const isMissing = () =>
      !this.#schemaSegments[segmentName] && this.#segments.some((s) => s.segmentName === segmentName);
    if (this.#exit || !isMissing()) return;
    const schemaFilePath = path.join(this.#getSchemaOutAbsolutePath(), `${segmentName || ROOT_SEGMENT_FILE_NAME}.json`);
    const lastKnown = await fs
      .readFile(schemaFilePath, 'utf-8')
      .then((text) => JSON.parse(text) as VovkSegmentSchema | null)
      .catch(() => null);
    // a schema may have come in meanwhile
    if (!isMissing()) return;
    this.#schemaSegments[segmentName] =
      lastKnown?.controllers && (lastKnown.segmentName ?? '') === segmentName
        ? lastKnown
        : getPlaceholderSchema(segmentName);
    this.#generateIfComplete();
  }

  #requestFailedSchemas() {
    for (const segmentName of this.#failedSegmentNames) {
      if (this.#segments.some((s) => s.segmentName === segmentName)) void this.#requestSchema(segmentName);
      else this.#failedSegmentNames.delete(segmentName);
    }
  }

  // isError: no schema came back; isRefused: one came back that can't be used
  async #fetchSchema(segmentName: string): Promise<{ isError: boolean; isRefused?: boolean }> {
    const { log, port, config } = this.#projectInfo;
    const devHttps = this.#devHttps ?? config.devHttps;
    const endpoint = getSchemaEndpoint({
      port,
      rootEntry: config.rootEntry,
      devHttps,
      segmentName,
    });

    log.debug(`Requesting schema for ${formatLoggedSegmentName(segmentName)} at ${endpoint}`);

    try {
      const resp = await fetch(endpoint, { dispatcher: devHttps ? this.#getSelfSignedDispatcher() : undefined });
      const text = await resp.text();
      const shortText = text.length > 2000 ? `${text.slice(0, 2000)}...` : text;

      if (resp.status === 404) {
        const message = `Schema request to ${chalkHighlightThing(endpoint)} for ${formatLoggedSegmentName(segmentName)} got 404. A basePath in the Next.js config is a likely cause: vovk dev requests the schema without it. Otherwise the segment did not compile, or another server listens on this port.`;
        if (this.#notFoundEndpoints.has(endpoint)) log.debug(message);
        else log.warn(message);
        this.#notFoundEndpoints.add(endpoint);
        return { isError: true };
      }

      if (resp.status !== 200) {
        log.warn(
          `Schema request to ${chalkHighlightThing(endpoint)} for ${formatLoggedSegmentName(segmentName)} failed with status code ${resp.status} but expected 200.`
        );
        log.warn(`Response from ${formatLoggedSegmentName(segmentName)}: ${shortText}`);
        return { isError: true };
      }

      this.#notFoundEndpoints.delete(endpoint);
      let json: { schema: VovkSegmentSchema | null };
      try {
        json = JSON.parse(text);
      } catch (error) {
        log.error(
          `Error parsing JSON from ${chalkHighlightThing(endpoint)} for ${formatLoggedSegmentName(segmentName)}: ${(error as Error)?.message}`
        );
        log.error(`Response text: ${shortText}`);
        return { isError: true };
      }

      let segmentSchema: VovkSegmentSchema | null = null;
      try {
        ({ schema: segmentSchema } = json as { schema: VovkSegmentSchema | null });
      } catch (error) {
        log.error(`Error parsing schema for ${formatLoggedSegmentName(segmentName)}: ${(error as Error)?.message}`);
      }

      if (!(await this.#handleSegmentSchema(segmentName, segmentSchema))) return { isError: false, isRefused: true };
    } catch (error) {
      log.error(
        `Error requesting schema for ${formatLoggedSegmentName(segmentName)} at ${endpoint}: ${(error as Error)?.message}`
      );

      return { isError: true };
    }

    return { isError: false };
  }

  #generate = debounce(() => void this.#generateOneAtATime(), 1000);

  // a schema that comes in during a generation makes one more, which reads the newest schemas
  #generateOneAtATime = oneAtATime(async () => {
    try {
      await this.#writeMissingSchemaFiles();
      const fullSchema = {
        $schema: VovkSchemaIdEnum.SCHEMA,
        segments: this.#schemaSegments,
        meta: getMetaSchema({
          config: this.#projectInfo.config,
        }),
      };
      await generate({
        projectInfo: await loadOpenAPIMixins(this.#projectInfo),
        fullSchema,
        locatedSegments: this.#segments,
        cliGenerateOptions: { schemaPath: this.#getCliSchemaPath() },
      });
      this.#onFirstTimeGenerate?.();
    } catch (error) {
      this.#projectInfo.log.error(`Failed to generate the client: ${(error as Error)?.message ?? error}`);
      this.#failExitRun();
    }
  });

  #failExitRun() {
    if (this.#exit) process.exitCode = 1;
  }

  // the schema folder may be gone, or moved by a config change, and the client imports every file in it
  async #writeMissingSchemaFiles() {
    const schemaOutAbsolutePath = this.#getSchemaOutAbsolutePath();
    await fs.mkdir(schemaOutAbsolutePath, { recursive: true });
    await writeMetaJson(schemaOutAbsolutePath, this.#projectInfo);
    await Promise.all(
      Object.values(this.#schemaSegments).map((segmentSchema) =>
        writeOneSegmentSchemaFile({ schemaOutAbsolutePath, segmentSchema, skipIfExists: true })
      )
    );
  }

  // false when the schema can't be used
  async #handleSegmentSchema(segmentName: string, segmentSchema: VovkSegmentSchema | null): Promise<boolean> {
    const { log, config, cwd } = this.#projectInfo;
    if (!segmentSchema) {
      log.warn(`${formatLoggedSegmentName(segmentName, { upperFirst: true })} schema is null`);
      this.#failExitRun();
      return false;
    }

    log.debug(`Handling received schema from ${formatLoggedSegmentName(segmentName)}`);

    try {
      assertSegmentName(segmentName);
    } catch (error) {
      log.error((error as Error).message);
      this.#failExitRun();
      return false;
    }

    // the write path is built from segmentName, an http response must not name a different segment
    if ((segmentSchema.segmentName ?? '') !== segmentName) {
      log.error(
        `Schema for ${formatLoggedSegmentName(segmentName)} reported a different segment name ${JSON.stringify(segmentSchema.segmentName)}, ignoring it`
      );
      this.#failExitRun();
      return false;
    }

    const schemaOutAbsolutePath = path.resolve(cwd, this.#schemaOut ?? config.schemaOutDir);
    const segment = this.#segments.find((s) => s.segmentName === segmentName);

    if (!segment) {
      log.warn(`${formatLoggedSegmentName(segmentName)} not found`);
      return true;
    }

    this.#schemaSegments[segmentName] = segmentSchema;
    // written with emitSchema off too, so vovk generate leaves the segment out of the client
    if (segmentSchema.emitSchema || isEmpty(segmentSchema.controllers)) {
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
    } else {
      log.error(
        `Non-empty schema provided for ${formatLoggedSegmentName(segment.segmentName)} but "emitSchema" is false`
      );
    }

    this.#generateIfComplete();
    return true;
  }

  async start({ exit }: { exit: boolean }) {
    const now = Date.now();
    this.#projectInfo = await getProjectInfo({ logLevel: this.#logLevel });
    const { log, config, cwd, apiDirAbsolutePath } = this.#projectInfo;
    this.#segments = await locateSegments({ dir: apiDirAbsolutePath, config, log });
    log.info('Starting...');
    this.#exit = exit;

    if (exit) {
      this.#onFirstTimeGenerate = once(() => {
        log.info('The schemas and the RPC client have been generated. Exiting...');
      });
    }

    process.on('uncaughtException', (err) => {
      log.error(`Uncaught Exception: ${err.message}`);
      this.#failExitRun();
    });

    process.on('unhandledRejection', (reason) => {
      log.error(`Unhandled Rejection: ${String(reason)}`);
      this.#failExitRun();
    });

    const schemaOutAbsolutePath = path.resolve(cwd, this.#schemaOut ?? config.schemaOutDir);

    const segmentNames = this.#segments.map((s) => s.segmentName);

    await ensureSchemaFiles(this.#projectInfo, schemaOutAbsolutePath, segmentNames);

    await ensureClient(this.#projectInfo, this.#segments, this.#getCliSchemaPath());

    // no segment schema to wait for, the client of the OpenAPI mixins is generated now
    if (!this.#segments.length && !isEmpty(this.#projectInfo.openAPIMixins)) this.#generate();

    const MAX_ATTEMPTS = 5;
    const DELAY = 5000;

    setTimeout(() => {
      for (const { segmentName } of this.#segments) {
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
                this.#failExitRun();
                return;
              }
              void this.#requestSchema(segmentName).then(({ isError: isError2 }) => {
                if (!isError2) {
                  clearInterval(interval);
                  log.info(
                    `Requested schema for ${formatLoggedSegmentName(segmentName)} after ${attempts} attempt${attempts === 1 ? '' : 's'}`
                  );
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
  new VovkDev({
    schemaOut: env.__VOVK_SCHEMA_OUT_FLAG__ || undefined,
    devHttps: env.__VOVK_DEV_HTTPS_FLAG__ === 'true' || undefined,
    logLevel: env.__VOVK_LOG_LEVEL__,
  })
    .start({
      exit: env.__VOVK_EXIT__ === 'true',
    })
    // exit code 1 makes vovk dev --next-dev stop next dev and fail too
    .catch((error: unknown) => {
      console.error(`🐺 ❌ ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    });
}
