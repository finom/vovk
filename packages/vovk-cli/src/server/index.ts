import * as chokidar from 'chokidar';
import * as http from 'http';
import fs from 'fs/promises';
import getProjectInfo, { ProjectInfo } from '../getProjectInfo';
import path from 'path';
import { debouncedEnsureMetadataFiles } from './ensureMetadataFiles';
import createMetadataServer from './createMetadataServer';
import writeOneMetadataFile from './writeOneMetadataFile';
import logDiffResult from './logDiffResult';
import generateClient from './generateClient';
import locateSegments, { type Segment } from '../locateSegments';
import debounceWithArgs from '../utils/debounceWithArgs';
import { debounce } from 'lodash';
import { VovkEnv } from '../types';

export class VovkCLIServer {
  #projectInfo: ProjectInfo;

  #segments: Segment[] = [];

  #isWatching = false;

  #modulesWatcher: chokidar.FSWatcher | null = null;

  #segmentWatcher: chokidar.FSWatcher | null = null;

  #watchSegments = () => {
    const segmentReg = /\/\[\[\.\.\.[a-zA-Z-_]+\]\]\/route.ts$/;
    const { apiDir, log, metadataOutFullPath } = this.#projectInfo;
    log.debug(`Watching segments in ${apiDir}`);
    this.#segmentWatcher = chokidar
      .watch(apiDir, {
        persistent: true,
      })
      .on('add', (filePath) => {
        if (segmentReg.test(filePath)) {
          const segmentName = path.relative(apiDir, filePath).replace(segmentReg, '');
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
      .on('unlink', (filePath) => {
        if (segmentReg.test(filePath)) {
          const segmentName = path.relative(apiDir, filePath).replace(segmentReg, '');
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
      .on('error', (error) => {
        log.error(`Error watching segments folder: ${error.message}`);
      });
  };

  #watchModules = () => {
    const { config, log } = this.#projectInfo;
    log.debug(`Watching modules in ${config.modulesDir}`);
    this.#modulesWatcher = chokidar
      .watch(config.modulesDir, {
        persistent: true,
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
      .on('error', (error) => {
        log.error(`Error watching modules folder: ${error.message}`);
      });
  };

  #watchConfig = () => {
    const { log } = this.#projectInfo;
    log.debug(`Watching config files`);
    const handle = debounce(async () => {
      this.#projectInfo = await getProjectInfo();
      log.info('Config file has been updated');
      await this.#modulesWatcher?.close();
      await this.#segmentWatcher?.close();
    }, 1000);

    chokidar
      .watch('vovk.config.{js,mjs,cjs}', {
        persistent: true,
        cwd: process.cwd(),
        ignoreInitial: false,
        depth: 0,
      })
      .on('add', () => void handle())
      .on('change', () => void handle())
      .on('unlink', () => void handle())
      .on('error', (error) => {
        log.error(`Error watching config files: ${error.message}`);
      });
  };

  #watch() {
    if (this.#isWatching) throw new Error('Already watching');
    const { apiDir, log, config } = this.#projectInfo;

    log.info(
      `Watching segments in ${apiDir} and modules in ${config.modulesDir}. Detected initial segments: ${this.#segments.map((s) => s.segmentName).join(', ')}.`
    );

    this.#watchSegments();
    this.#watchModules();
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
      const affectedSegments = this.#segments.filter((s) =>
        namesOfClasses.some((name) => s.metadata?.controllers[name] || s.metadata?.workers[name])
      );

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
    const { apiEntryPoint, log } = this.#projectInfo;
    const endpoint = `${apiEntryPoint}/${segmentName}/_vovk-ping_`;
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
    const { metadataOutFullPath, log } = this.#projectInfo;
    return createMetadataServer(
      async (metadata) => {
        const segment = this.#segments.find((s) => s.segmentName === metadata.segmentName);

        if (!segment) {
          log.error(`Segment "${metadata.segmentName}" not found`);
          return;
        }

        segment.metadata = metadata;

        const now = Date.now();
        const { diffResult } = await writeOneMetadataFile({
          metadataOutFullPath,
          segmentName: metadata.segmentName,
          metadata,
          skipIfExists: false,
        });

        const timeTook = Date.now() - now;

        if (diffResult) {
          logDiffResult(segment.segmentName, diffResult, this.#projectInfo);
          log.info(`Metadata for segment "${metadata.segmentName}" has been updated in ${timeTook}ms`);
        }

        if (this.#segments.every((s) => s.metadata)) {
          log.debug(`All segments have metadata.`);
          await generateClient(this.#projectInfo, this.#segments);
        }
      },
      (error) => {
        log.error(String(error));
      }
    );
  }

  async startServer({ clientOutDir }: { clientOutDir?: string } = {}) {
    this.#projectInfo = await getProjectInfo({ clientOutDir });
    this.#segments = await locateSegments(this.#projectInfo.srcRoot);
    const { vovkPort, log, metadataOutFullPath } = this.#projectInfo;
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
