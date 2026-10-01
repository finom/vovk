import { EntityType } from '@prisma/client';
import type { TaskType } from '@schemas/models/Task.schema';
import type { UserType } from '@schemas/models/User.schema';
import type { VovkBody, VovkOutput, VovkParams } from 'vovk';
import DatabaseService from '../database/database-service';
import EmbeddingService from '../embedding/embedding-service';
import type TaskController from './task-controller';

export default class TaskService {
  static getTasks = () =>
    DatabaseService.prisma.task.findMany() as Promise<TaskType[]>;

  static findTasks = (search: string) =>
    EmbeddingService.vectorSearch<TaskType>(EntityType.task, search);

  static getTasksByUserId = (userId: UserType['id']) =>
    DatabaseService.prisma.task.findMany({
      where: { userId },
    }) as Promise<TaskType[]>;

  static createTask = async (
    data: VovkBody<typeof TaskController.createTask>,
  ) => {
    const task = await DatabaseService.prisma.task.create({ data });

    await EmbeddingService.generateEntityEmbedding(
      task.entityType,
      task.id as TaskType['id'],
    );

    return task as TaskType;
  };

  static updateTask = async (
    id: VovkParams<typeof TaskController.updateTask>['id'],
    data: VovkBody<typeof TaskController.updateTask>,
  ) => {
    const task = await DatabaseService.prisma.task.update({
      where: { id },
      data,
    });

    await EmbeddingService.generateEntityEmbedding(task.entityType, id);

    return task as TaskType;
  };

  static deleteTask = (
    id: VovkParams<typeof TaskController.deleteTask>['id'],
  ) =>
    DatabaseService.prisma.task.delete({
      where: { id },
      select: { id: true, entityType: true },
      // TODO: __isDeleted incompatibility
    }) as unknown as Promise<VovkOutput<typeof TaskController.deleteTask>>;
}
