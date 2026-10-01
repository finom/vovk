import { initSegment } from 'vovk';
import AiSdkController from '../../../modules/ai/ai-sdk-controller';
import DatabasePollController from '../../../modules/database/database-poll-controller';
import RealtimeController from '../../../modules/realtime/realtime-controller';
import TaskController from '../../../modules/task/task-controller';
import UserController from '../../../modules/user/user-controller';

const controllers = {
  UserRPC: UserController,
  TaskRPC: TaskController,
  RealtimeRPC: RealtimeController,
  DatabasePollRPC: DatabasePollController,
  AiSdkRPC: AiSdkController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({
  emitSchema: true,
  controllers,
  onError: console.error,
});
