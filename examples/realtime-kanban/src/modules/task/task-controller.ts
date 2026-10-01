import { TaskSchema, UserSchema } from '@schemas/index';
import { del, get, operation, post, prefix, procedure, put } from 'vovk';
import { z } from 'zod';
import { BASE_FIELDS } from '@/constants';
import { sessionGuard } from '@/decorators/session-guard';
import TaskService from './task-service';

@prefix('tasks')
export default class TaskController {
  @operation.tool({
    hidden: true,
  })
  @operation({
    summary: 'Get all tasks',
    description: 'Retrieves a list of all tasks.',
  })
  @get()
  @sessionGuard()
  static getTasks = procedure({
    output: TaskSchema.array(),
  }).handle(TaskService.getTasks);

  @operation({
    summary: 'Find tasks by ID, title or description',
    description:
      'Retrieves tasks that match the provided ID, title, or description. Used to search the tasks when they need to be updated or deleted.',
  })
  @get('search')
  @sessionGuard()
  static findTasks = procedure({
    query: z.object({
      search: z.string().meta({
        description: 'Search term for tasks',
        examples: ['bug', 'feature'],
      }),
    }),
    output: TaskSchema.array(),
  }).handle(async ({ vovk }) => TaskService.findTasks(vovk.query().search));

  @operation({
    summary: 'Get tasks assigned to a specific user',
    description: 'Retrieves all tasks associated with a specific user ID.',
  })
  @get('by-user/{userId}')
  @sessionGuard()
  static getTasksByUserId = procedure({
    params: z.object({ userId: UserSchema.shape.id }),
    output: TaskSchema.array(),
  }).handle(async ({ vovk }) =>
    TaskService.getTasksByUserId(vovk.params().userId),
  );

  @operation({
    summary: 'Create a new task',
    description:
      'Creates a new task with the provided details, such as its title and description.',
  })
  @post()
  @sessionGuard()
  static createTask = procedure({
    body: TaskSchema.omit(BASE_FIELDS),
    output: TaskSchema,
  }).handle(async ({ vovk }) => TaskService.createTask(await vovk.body()));

  @operation({
    summary: 'Update task',
    description:
      'Updates an existing task with the provided details, such as its title or description.',
  })
  @put('{id}')
  @sessionGuard()
  static updateTask = procedure({
    body: TaskSchema.omit(BASE_FIELDS).partial(),
    params: TaskSchema.pick({ id: true }),
    output: TaskSchema,
  }).handle(async ({ vovk }) =>
    TaskService.updateTask(vovk.params().id, await vovk.body()),
  );

  @operation({
    summary: 'Delete task',
    description: 'Deletes a task by ID.',
  })
  @del('{id}')
  @sessionGuard()
  static deleteTask = procedure({
    params: TaskSchema.pick({ id: true }),
    output: TaskSchema.partial().extend({
      __isDeleted: z.literal(true),
    }),
  }).handle(async ({ vovk }) => TaskService.deleteTask(vovk.params().id));
}
