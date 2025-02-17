import chalk from 'chalk';
import type { DiffResult } from './diffSegmentSchema.mjs';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';
import formatLoggedSegmentName from '../utils/formatLoggedSegmentName.mjs';
import chalkHighlightThing from '../utils/chalkHighlightThing.mjs';

export default function logDiffResult(segmentName: string, diffResult: DiffResult, projectInfo: ProjectInfo) {
  const diffNormalized: {
    what: 'controller' | 'controllerHandler';
    type: 'added' | 'removed' | 'changed';
    name: string;
  }[] = [];

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

  const LIMIT = diffNormalized.length < 17 ? diffNormalized.length : 15;
  const addedText = chalk.green('added');
  const removedText = chalk.red('removed');
  const changedText = chalk.cyan('changed');

  for (const diffNormalizedItem of diffNormalized.slice(0, LIMIT)) {
    switch (diffNormalizedItem.what) {
      case 'controller':
        switch (diffNormalizedItem.type) {
          case 'added':
            projectInfo.log.info(
              `Schema for RPC ${chalkHighlightThing(diffNormalizedItem.name)} has been ${addedText} at ${formatLoggedSegmentName(segmentName)}`
            );
            break;
          case 'removed':
            projectInfo.log.info(
              `Schema for RPC ${chalkHighlightThing(diffNormalizedItem.name)} has been ${removedText} from ${formatLoggedSegmentName(segmentName)}`
            );
            break;
        }
        break;
      case 'controllerHandler':
        switch (diffNormalizedItem.type) {
          case 'added':
            projectInfo.log.info(
              `Schema for RPC method ${chalkHighlightThing(diffNormalizedItem.name)} has been ${addedText} at ${formatLoggedSegmentName(segmentName)}`
            );
            break;
          case 'removed':
            projectInfo.log.info(
              `Schema for RPC method ${chalkHighlightThing(diffNormalizedItem.name)} has been ${removedText} from ${formatLoggedSegmentName(segmentName)}`
            );
            break;
          case 'changed':
            projectInfo.log.info(
              `Schema for RPC method ${chalkHighlightThing(diffNormalizedItem.name)} has been ${changedText} at ${formatLoggedSegmentName(segmentName)}`
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
