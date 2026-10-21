import { initSegment } from 'vovk';
import TaskController from '@/modules/task/task-controller';

const controllers = {
  TaskRPC: TaskController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, DELETE } = initSegment({
  emitSchema: true,
  controllers,
});
