import { ProjectInfo } from '../getProjectInfo/index.mjs';
import { DiffResult } from './diffSchema.mjs';
import formatLoggedSegmentName from '../utils/formatLoggedSegmentName.mjs';
import chalkHighlightThing from '../utils/chalkHighlightThing.mjs';

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

  diffResult.workers.handlers.forEach((handler) => {
    handler.added.forEach((name) => {
      diffNormalized.push({ what: 'workerHandler', type: 'added', name: `${handler.nameOfClass}.${name}` });
    });

    handler.removed.forEach((name) => {
      diffNormalized.push({ what: 'workerHandler', type: 'removed', name: `${handler.nameOfClass}.${name}` });
    });

    handler.changed.forEach((name) => {
      diffNormalized.push({ what: 'workerHandler', type: 'changed', name: `${handler.nameOfClass}.${name}` });
    });
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

  const LIMIT = diffNormalized.length < 12 ? diffNormalized.length : 10;

  for (const diffNormalizedItem of diffNormalized.slice(0, LIMIT)) {
    switch (diffNormalizedItem.what) {
      case 'worker':
        switch (diffNormalizedItem.type) {
          case 'added':
            projectInfo.log.info(
              `Schema for worker ${chalkHighlightThing(diffNormalizedItem.name)} has been added at ${formatLoggedSegmentName(segmentName)}`
            );
            break;
          case 'removed':
            projectInfo.log.info(
              `Schema for worker ${chalkHighlightThing(diffNormalizedItem.name)} has been removed from ${formatLoggedSegmentName(segmentName)}`
            );
            break;
        }
        break;
      case 'controller':
        switch (diffNormalizedItem.type) {
          case 'added':
            projectInfo.log.info(
              `Schema for controller ${chalkHighlightThing(diffNormalizedItem.name)} has been added at ${formatLoggedSegmentName(segmentName)}`
            );
            break;
          case 'removed':
            projectInfo.log.info(
              `Schema for controller ${chalkHighlightThing(diffNormalizedItem.name)} has been removed from ${formatLoggedSegmentName(segmentName)}`
            );
            break;
        }
        break;
      case 'workerHandler':
        switch (diffNormalizedItem.type) {
          case 'added':
            projectInfo.log.info(
              `Schema for worker method ${chalkHighlightThing(diffNormalizedItem.name)} has been added at ${formatLoggedSegmentName(segmentName)}`
            );
            break;
          case 'removed':
            projectInfo.log.info(
              `Schema for worker method ${chalkHighlightThing(diffNormalizedItem.name)} has been removed from ${formatLoggedSegmentName(segmentName)}`
            );
            break;
        }
        break;

      case 'controllerHandler':
        switch (diffNormalizedItem.type) {
          case 'added':
            projectInfo.log.info(
              `Schema for controller method ${chalkHighlightThing(diffNormalizedItem.name)} has been added at ${formatLoggedSegmentName(segmentName)}`
            );
            break;
          case 'removed':
            projectInfo.log.info(
              `Schema for controller method ${chalkHighlightThing(diffNormalizedItem.name)} has been removed from ${formatLoggedSegmentName(segmentName)}`
            );
            break;
          case 'changed':
            projectInfo.log.info(
              `Schema for controller method ${chalkHighlightThing(diffNormalizedItem.name)} has been changed at ${formatLoggedSegmentName(segmentName)}`
            );
            break;
        }
        break;
    }
  }

  if (diffNormalized.length > LIMIT) {
    projectInfo.log.info(`... and ${diffNormalized.length - LIMIT} more changes`);
  }
}
