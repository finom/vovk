import * as chokidar from 'chokidar';
import * as http from 'http';
import fs from 'fs/promises';
import getProjectInfo, { ProjectInfo } from '../getProjectInfo/index.mjs';
import path from 'path';
import { debouncedEnsureMetadataFiles } from './ensureMetadataFiles.mjs';
import createMetadataServer from './createMetadataServer.mjs';
import writeOneMetadataFile from './writeOneMetadataFile.mjs';
import logDiffResult from './logDiffResult.mjs';
import generateClient from './generateClient.mjs';
import locateSegments, { type Segment } from '../locateSegments.mjs';
import debounceWithArgs from '../utils/debounceWithArgs.mjs';
import debounce from 'lodash/debounce.js';
import isEmpty from 'lodash/isEmpty.js';
import { VovkEnv } from '../types.mjs';
import { VovkMetadata } from 'vovk';

export class VovkCLIServer {
  #projectInfo: ProjectInfo;

  #segments: Segment[] = [];

  #metadata: Record<string, VovkMetadata> = {};

  #isWatching = false;

  #modulesWatcher: chokidar.FSWatcher | null = null;

  #segmentWatcher: chokidar.FSWatcher | null = null;

  #watchSegments = () => {
    const segmentReg = /\/?\[\[\.\.\.[a-zA-Z-_]+\]\]\/route.ts$/;
    const { cwd, log, config, apiDir } = this.#projectInfo;
    const metadataOutFullPath = path.join(cwd, config.metadataOutDir);
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

          void debouncedEnsureMetadataFiles(
            metadataOutFullPath,
            this.#segments.map((s) => s.segmentName),
            this.#projectInfo // TODO refactor
          );
        }
      })
      .on('change', (filePath) => {
        log.debug(`File ${filePath} has been changed at segments folder`);
        if (segmentReg.test(filePath)) {
          void this.#ping(getSegmentName(filePath));
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      .on('addDir', async (dirPath) => {
        log.debug(`Directory ${dirPath} has been added to segments folder`);
        this.#segments = await locateSegments(apiDirFullPath);
        for (const { segmentName } of this.#segments) {
          void this.#ping(segmentName);
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      .on('unlinkDir', async (dirPath) => {
        log.debug(`Directory ${dirPath} has been removed from segments folder`);
        this.#segments = await locateSegments(apiDirFullPath);
        for (const { segmentName } of this.#segments) {
          void this.#ping(segmentName);
        }
      })
      .on('unlink', (filePath) => {
        log.debug(`File ${filePath} has been removed from segments folder`);
        if (segmentReg.test(filePath)) {
          const segmentName = getSegmentName(filePath);
          this.#segments = this.#segments.filter((s) => s.segmentName !== segmentName);
          log.info(`Segment "${segmentName}" has been removed`);
          log.debug(`Full list of segments: ${this.#segments.map((s) => s.segmentName).join(', ')}`);

          void debouncedEnsureMetadataFiles(
            metadataOutFullPath,
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
          void this.#ping(segmentName);
        }
      })
      .on('unlinkDir', () => {
        for (const { segmentName } of this.#segments) {
          void this.#ping(segmentName);
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

    const importRegex =
      /import\s*{[^}]*\b(initVovk|get|post|put|del|head|options|worker)\b[^}]*}\s*from\s*['"]vovk['"]/;
    if (importRegex.test(code) && namesOfClasses.length) {
      const affectedSegments = this.#segments.filter((s) => {
        const metadata = this.#metadata[s.segmentName];
        if (!metadata) return false;
        return namesOfClasses.some((name) => metadata.controllers[name] || metadata.workers[name]);
      });

      if (affectedSegments.length) {
        log.debug(
          `A file with controller or worker ${namesOfClasses.join(', ')} have been modified at path "${filePath}". Segment(s) affected: ${affectedSegments.map((s) => s.segmentName).join(', ')}`
        );

        for (const segment of affectedSegments) {
          await this.#ping(segment.segmentName);
        }
      }
    }
  };

  #ping = debounceWithArgs((segmentName: string) => {
    const { apiEntryPoint, log, port } = this.#projectInfo;
    const endpoint = `${apiEntryPoint.startsWith('http') ? apiEntryPoint : `http://localhost:${port}${apiEntryPoint}`}/${segmentName ? `${segmentName}/` : ''}_vovk-ping_`;

    log.debug(`Pinging segment "${segmentName}" at ${endpoint}`);
    const req = http.get(endpoint, (resp) => {
      if (resp.statusCode !== 200) {
        log.warn(`Ping to segment "${segmentName}" failed with status code ${resp.statusCode}. Expected 200.`);
      }
    });

    req.on('error', (err) => {
      log.error(`Error during HTTP request made to ${endpoint}: ${err.message}`);
    });
  }, 500);

  #createMetadataServer() {
    const { log, config, cwd } = this.#projectInfo;
    const metadataOutFullPath = path.join(cwd, config.metadataOutDir);
    return createMetadataServer(
      async ({ metadata }) => {
        const segment = this.#segments.find((s) => s.segmentName === metadata.segmentName);

        if (!segment) {
          log.warn(`Segment "${metadata.segmentName}" not found`);
          return;
        }

        this.#metadata[metadata.segmentName] = metadata;
        if (metadata.emitMetadata) {
          const now = Date.now();
          const { diffResult } = await writeOneMetadataFile({
            metadataOutFullPath,
            metadata,
            skipIfExists: false,
          });

          const timeTook = Date.now() - now;

          if (diffResult) {
            logDiffResult(segment.segmentName, diffResult, this.#projectInfo);
            log.info(`Metadata for segment "${metadata.segmentName}" has been updated in ${timeTook}ms`);
          }
        } else if (metadata && (!isEmpty(metadata.controllers) || !isEmpty(metadata.workers))) {
          log.error(`Non-empty metadata provided for segment "${metadata.segmentName}" but emitMetadata is false`);
        }

        if (this.#segments.every((s) => this.#metadata[s.segmentName])) {
          log.debug(`All segments with emitMetadata=true have metadata.`);
          await generateClient(this.#projectInfo, this.#segments, this.#metadata);
        }
      },
      (error) => {
        log.error(String(error));
      }
    );
  }

  async startServer({ clientOutDir }: { clientOutDir?: string } = {}) {
    this.#projectInfo = await getProjectInfo({ clientOutDir });
    const { vovkPort, log, config, cwd, apiDir } = this.#projectInfo;

    process.on('uncaughtException', (err) => {
      log.error(`Uncaught Exception: ${err.message}`);
    });

    process.on('unhandledRejection', (reason) => {
      log.error(`Unhandled Rejection: ${String(reason)}`);
    });

    const apiDirFullPath = path.join(cwd, apiDir);
    const metadataOutFullPath = path.join(cwd, config.metadataOutDir);

    this.#segments = await locateSegments(apiDirFullPath);
    const server = this.#createMetadataServer();

    if (!vovkPort) {
      log.error('No port provided for Vovk Server. Exiting...');
      return;
    }

    await debouncedEnsureMetadataFiles(
      metadataOutFullPath,
      this.#segments.map((s) => s.segmentName),
      this.#projectInfo
    );

    server.listen(vovkPort, () => {
      log.info(`Vovk Metadata Server is running on port ${vovkPort}. Happy coding!`);
    });

    // Ping every segment in 3 seconds in order to update metadata and start watching
    setTimeout(() => {
      for (const { segmentName } of this.#segments) {
        void this.#ping(segmentName);
      }
      this.#watch();
    }, 3000);
  }
}
const env = process.env as VovkEnv;
if (env.__VOVK_START_SERVER_IN_STANDALONE_MODE__ === 'true') {
  void new VovkCLIServer().startServer();
}
