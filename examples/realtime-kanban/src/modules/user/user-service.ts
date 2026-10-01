import { EntityType } from '@prisma/client';
import type { TaskType } from '@schemas/models/Task.schema';
import type { UserType } from '@schemas/models/User.schema';
import type { VovkBody, VovkOutput, VovkParams } from 'vovk';
import DatabaseService from '../database/database-service';
import EmbeddingService from '../embedding/embedding-service';
import TaskService from '../task/task-service';
import type UserController from './user-controller';

export default class UserService {
  static getUsers = () =>
    DatabaseService.prisma.user.findMany() as Promise<UserType[]>;

  static findUsers = (search: string) =>
    EmbeddingService.vectorSearch<UserType>(EntityType.user, search);

  static createUser = async (
    data: VovkBody<typeof UserController.createUser>,
  ) => {
    const user = await DatabaseService.prisma.user.create({
      data: {
        ...data,
        imageUrl: `https://i.pravatar.cc/300?u=${data.email}`,
      },
    });

    await EmbeddingService.generateEntityEmbedding(
      user.entityType,
      user.id as UserType['id'],
    );
    return user as UserType;
  };

  static updateUser = async (
    id: VovkParams<typeof UserController.updateUser>['id'],
    data: VovkBody<typeof UserController.updateUser>,
  ) => {
    const user = await DatabaseService.prisma.user.update({
      where: { id },
      data,
    });

    await EmbeddingService.generateEntityEmbedding(user.entityType, id);

    return user as UserType;
  };

  static deleteUser = async (
    id: VovkParams<typeof UserController.updateUser>['id'],
  ) => {
    // Even though we have `ON DELETE CASCADE`, we need to delete tasks explicitly to trigger DB events
    const tasksToDelete = await DatabaseService.prisma.task.findMany({
      where: { userId: id },
      select: { id: true },
    });

    // 1) Explicitly delete the user's tasks (fires DB events)
    // 2) Delete the user record
    // 3) Return a single payload that merges task deletion results with the user deletion result,
    //    preserving __isDeleted flags so the UI can reconcile in one update
    return Object.assign(
      {
        tasks: await Promise.all(
          tasksToDelete.map((t) =>
            TaskService.deleteTask(t.id as TaskType['id']),
          ),
        ),
      },
      await DatabaseService.prisma.user.delete({
        where: { id },
        select: { id: true, entityType: true },
      }),
    ) as VovkOutput<typeof UserController.deleteUser>;
  };
}
