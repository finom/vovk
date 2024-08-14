import * as chokidar from 'chokidar';
import * as http from 'http';
import fs from 'fs/promises';
/*
1. Watch modules and routes
2. Write .vovk/index.js with module.exports = {};
3. Create separate file for each segment
4. Update.vovk/index.js with require('./segment')
5. Show time taken for metadata and client
6. Show diff for controllers, workers, and their methods with additional info such as segment name, time taken
    - New controller has been added to segment "segmentName"
    - Controller "controllerName" has been removed from segment "segmentName"
    - New worker has been added to segment "segmentName"
    - Worker "workerName" has been removed from segment "segmentName"
    - New method "methodName" has been added to controller "controllerName" in segment "segmentName"
    - Method "methodName" has been removed from controller "controllerName" in segment "segmentName"
7. Ping every segment separately depending on if it's changed or if segment controller is changed (detect by controller name?)
*/

import getProjectInfo from '../getProjectInfo';
import path from 'path';
import { debouncedEnsureMetadataFiles } from './ensureMetadataFiles';
import createMetadataServer from './createMetadataServer';
import writeOneMetadataFile from './writeOneMetadataFile';
import logDiffResult from './logDiffResult';
import { debounce } from 'lodash';
import { KnownAny } from '../types';
import generateClient from './generateClient';
import locateSegments from '../locateSegments';

export async function sererMain() {
  const projectInfo = await getProjectInfo();
  const {
    // port,
    vovkPort,
    apiEntryPoint,
    apiDir,
    // nextProjectInfo,
    srcRoot,
    config,
    log,
    metadataOutFullPath,
  } = projectInfo;
  let segments = await locateSegments(srcRoot);

  const segmentWatcher = chokidar.watch(apiDir, {
    persistent: true,
  });

  log.info(`Watching segments in ${apiDir}. Detected segments: ${segments.map((s) => s.segmentName).join(', ')}.`);

  const segmentReg = /\/\[\[\.\.\.[a-zA-Z-_]+\]\]\/route.ts$/;

  const pingNoDebounce = (segmentName: string) => {
    const endpoint = `${apiEntryPoint}/${segmentName}/_vovk-ping_`;
    const req = http.get(endpoint, (resp) => {
      if (resp.statusCode !== 200) {
        log.warn(`Ping to segment "${segmentName}" failed with status code ${resp.statusCode}. Expected 200.`);
      }
    });

    req.on('error', (err) => {
      log.error(`Error during HTTP request made to ${endpoint}: ${err.message}`);
    });
  };

  function debounceWithArgs<T extends (...args: KnownAny[]) => KnownAny>(
    fn: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    const debouncedFunctions = new Map<string, ReturnType<typeof debounce>>();

    return (...args: Parameters<T>) => {
      const key = JSON.stringify(args);

      if (!debouncedFunctions.has(key)) {
        debouncedFunctions.set(key, debounce(fn, wait));
      }

      const debouncedFn = debouncedFunctions.get(key);
      if (debouncedFn) {
        debouncedFn(...args);
      }
    };
  }

  const ping = debounceWithArgs(pingNoDebounce, 500);

  function watch() {
    segmentWatcher
      .on('add', (filePath) => {
        if (segmentReg.test(filePath)) {
          const segmentName = path.relative(apiDir, filePath).replace(segmentReg, '');
          segments = segments.find((s) => s.segmentName === segmentName)
            ? segments
            : [...segments, { routeFilePath: filePath, segmentName }];
          log.info(`Segment "${segmentName}" has been added`);
          log.debug(`Full list of segments: ${segments.map((s) => s.segmentName).join(', ')}`);

          void debouncedEnsureMetadataFiles(
            metadataOutFullPath,
            segments.map((s) => s.segmentName),
            projectInfo
          );
        }
      })
      .on('unlink', (filePath) => {
        if (segmentReg.test(filePath)) {
          const segmentName = path.relative(apiDir, filePath).replace(segmentReg, '');
          segments = segments.filter((s) => s.segmentName !== segmentName);
          log.info(`Segment "${segmentName}" has been removed`);
          log.debug(`Full list of segments: ${segments.map((s) => s.segmentName).join(', ')}`);

          void debouncedEnsureMetadataFiles(
            metadataOutFullPath,
            segments.map((s) => s.segmentName),
            projectInfo
          );
        }
      });

    log.info(`Watching modules in ${config.modulesDir}.`);

    const modulesWatcher = chokidar.watch(config.modulesDir, {
      persistent: true,
    });

    const processControllerChange = async (filePath: string) => {
      const code = await fs.readFile(filePath, 'utf-8').catch(() => null);
      if (typeof code !== 'string') return;
      const nameOfClasReg = /\bclass\s+([A-Za-z_]\w*)(?:\s*<[^>]*>)?\s*\{/g;
      const namesOfClasses = [...code.matchAll(nameOfClasReg)].map((match) => match[1]);

      const importRegex =
        /import\s*{[^}]*\b(initVovk|get|post|put|del|head|options|worker)\b[^}]*}\s*from\s*['"]vovk['"]/;
      if (importRegex.test(code) && namesOfClasses.length) {
        const affectedSegments = segments.filter((s) =>
          namesOfClasses.some((name) => s.metadata?.controllers[name] || s.metadata?.workers[name])
        );

        if (affectedSegments.length) {
          log.debug(
            `A file with controller or worker ${namesOfClasses.join(', ')} have been modified at path "${filePath}". Segment(s) affected: ${affectedSegments.map((s) => s.segmentName).join(', ')}`
          );

          for (const segment of affectedSegments) {
            ping(segment.segmentName);
          }
        }
      }
    };

    modulesWatcher
      .on('add', (filePath) => {
        log.debug(`File ${filePath} has been added to modules folder`);
        void processControllerChange(filePath);
      })
      .on('change', (filePath) => {
        log.debug(`File ${filePath} has been changed at modules folder`);
        void processControllerChange(filePath);
      })
      .on('unlink', (filePath) => {
        log.debug(`File ${filePath} has been removed from modules folder`);
      });
  }

  const server = createMetadataServer(
    async (metadata) => {
      const segment = segments.find((s) => s.segmentName === metadata.segmentName);

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
        logDiffResult(segment.segmentName, diffResult, projectInfo);
        log.info(`Metadata for segment "${metadata.segmentName}" has been updated in ${timeTook}ms`);
      }

      if (segments.every((s) => s.metadata)) {
        log.debug(`All segments have metadata. Generating client...`);
        const now = Date.now();
        await generateClient(projectInfo, segments);
        log.info(`Client generated in ${Date.now() - now}ms`);
      }
    },
    (error) => {
      log.error(String(error));
    }
  );

  async function startServer() {
    if (!vovkPort) {
      log.error('No port provided for Vovk Server. Exiting...');
      return;
    }

    await debouncedEnsureMetadataFiles(
      metadataOutFullPath,
      segments.map((s) => s.segmentName),
      projectInfo
    );

    server.listen(vovkPort, () => {
      log.info(`Vovk Metadata Server is running on port ${vovkPort}. Happy coding!`);
    });

    // Ping every segment in 3 seconds in order to update metadata and start watching
    setTimeout(() => {
      for (const { segmentName } of segments) {
        ping(segmentName);
      }
      void watch();
    }, 3000);
  }

  return { startServer };
}
