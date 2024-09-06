import chalk from 'chalk';
import { ProjectInfo } from '../getProjectInfo/index.mjs';
import { DiffResult } from './diffSchema.mjs';
import formatLoggedSegmentName from '../utils/formatLoggedSegmentName.mjs';

export default function logDiffResult(segmentName: string, diffResult: DiffResult, projectInfo: ProjectInfo) {
  const diffNormalized: {
    what: 'worker' | 'controller' | 'workerHandler' | 'controllerHandler';
    type: 'added' | 'removed' | 'changed';
    name: string;
  }[] = [];

  diffResult.workers.added.forEach((name) => {
    diffNormalized.push({ what: 'worker', type: 'added', name });
  });

  diffResult.workers.removed.forEach((name) => {
    diffNormalized.push({ what: 'worker', type: 'removed', name });
  });

  diffResult.controllers.added.forEach((name) => {
    diffNormalized.push({ what: 'controller', type: 'added', name });
  });

  diffResult.controllers.removed.forEach((name) => {
    diffNormalized.push({ what: 'controller', type: 'removed', name });
  });

  diffResult.controllers.handlers.forEach((handler) => {
    handler.added.forEach((name) => {
      diffNormalized.push({ what: 'controllerHandler', type: 'added', name: `${handler.nameOfClass}.${name}` });
    });

    handler.removed.forEach((name) => {
      diffNormalized.push({ what: 'controllerHandler', type: 'removed', name: `${handler.nameOfClass}.${name}` });
    });

    handler.changed.forEach((name) => {
      diffNormalized.push({ what: 'controllerHandler', type: 'changed', name: `${handler.nameOfClass}.${name}` });
    });
  });

  const LIMIT = 5;

  for (const diffNormalizedItem of diffNormalized.slice(0, LIMIT)) {
    switch (diffNormalizedItem.what) {
      case 'worker':
        switch (diffNormalizedItem.type) {
          case 'added':
            projectInfo.log.info(
              `Schema for worker ${chalk.white.bold(diffNormalizedItem.name)} has been added at ${formatLoggedSegmentName(segmentName, true)}`
            );
            break;
          case 'removed':
            projectInfo.log.info(
              `Schema for worker ${chalk.white.bold(diffNormalizedItem.name)} has been removed from ${formatLoggedSegmentName(segmentName, true)}`
            );
            break;
        }
        break;
      case 'controller':
        switch (diffNormalizedItem.type) {
          case 'added':
            projectInfo.log.info(
              `Schema for controller ${chalk.white.bold(diffNormalizedItem.name)} has been added at ${formatLoggedSegmentName(segmentName, true)}`
            );
            break;
          case 'removed':
            projectInfo.log.info(
              `Schema for controller ${chalk.white.bold(diffNormalizedItem.name)} has been removed from ${formatLoggedSegmentName(segmentName, true)}`
            );
            break;
        }
        break;
      case 'workerHandler':
        switch (diffNormalizedItem.type) {
          case 'added':
            projectInfo.log.info(
              `Schema for worker method ${chalk.white.bold(diffNormalizedItem.name)} has been added at ${formatLoggedSegmentName(segmentName, true)}`
            );
            break;
          case 'removed':
            projectInfo.log.info(
              `Schema for worker method ${chalk.white.bold(diffNormalizedItem.name)} has been removed from ${formatLoggedSegmentName(segmentName, true)}`
            );
            break;
        }
        break;

      case 'controllerHandler':
        switch (diffNormalizedItem.type) {
          case 'added':
            projectInfo.log.info(
              `Schema for controller method ${chalk.white.bold(diffNormalizedItem.name)} has been added at ${formatLoggedSegmentName(segmentName, true)}`
            );
            break;
          case 'removed':
            projectInfo.log.info(
              `Schema for controller method ${chalk.white.bold(diffNormalizedItem.name)} has been removed from ${formatLoggedSegmentName(segmentName, true)}`
            );
            break;
          case 'changed':
            projectInfo.log.info(
              `Schema for controller method ${chalk.white.bold(diffNormalizedItem.name)} has been changed at ${formatLoggedSegmentName(segmentName, true)}`
            );
            break;
        }
        break;
    }
  }

  if (diffNormalized.length > LIMIT) {
    projectInfo.log.info(`...and ${diffNormalized.length - LIMIT} more changes`);
  }
}
