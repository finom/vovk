import chalk from 'chalk';
import { ProjectInfo } from '../getProjectInfo';
import { DiffResult } from './diffMetadata';

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
              `New worker ${chalk.white.bold(diffNormalizedItem.name)} has been added to segment "${chalk.white.bold(segmentName)}"`
            );
            break;
          case 'removed':
            projectInfo.log.info(
              `Worker ${chalk.white.bold(diffNormalizedItem.name)} has been removed from segment "${chalk.white.bold(segmentName)}"`
            );
            break;
        }
        break;
      case 'controller':
        switch (diffNormalizedItem.type) {
          case 'added':
            projectInfo.log.info(
              `New controller ${chalk.white.bold(diffNormalizedItem.name)} has been added to segment "${chalk.white.bold(segmentName)}"`
            );
            break;
          case 'removed':
            projectInfo.log.info(
              `Controller ${chalk.white.bold(diffNormalizedItem.name)} has been removed from segment "${chalk.white.bold(segmentName)}"`
            );
            break;
        }
        break;
      case 'workerHandler':
        switch (diffNormalizedItem.type) {
          case 'added':
            projectInfo.log.info(
              `New worker method ${chalk.white.bold(diffNormalizedItem.name)} has been added in segment "${chalk.white.bold(segmentName)}"`
            );
            break;
          case 'removed':
            projectInfo.log.info(
              `Worker method ${chalk.white.bold(diffNormalizedItem.name)} has been removed in segment "${chalk.white.bold(segmentName)}"`
            );
            break;
        }
        break;

      case 'controllerHandler':
        switch (diffNormalizedItem.type) {
          case 'added':
            projectInfo.log.info(
              `New controller method ${chalk.white.bold(diffNormalizedItem.name)} has been added in segment "${chalk.white.bold(segmentName)}"`
            );
            break;
          case 'removed':
            projectInfo.log.info(
              `Controller method ${chalk.white.bold(diffNormalizedItem.name)} has been removed in segment "${chalk.white.bold(segmentName)}"`
            );
            break;
          case 'changed':
            projectInfo.log.info(
              `Controller method ${chalk.white.bold(diffNormalizedItem.name)} has been changed in segment "${chalk.white.bold(segmentName)}"`
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
