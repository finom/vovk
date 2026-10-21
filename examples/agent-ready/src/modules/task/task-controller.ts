import { del, get, operation, patch, post, prefix, procedure } from 'vovk';
import { z } from 'zod';
import { type AuthMeta, authGuard } from '@/decorators/auth-guard';
import { TaskSchema } from './task-schema';
import TaskService from './task-service';

const TaskIdSchema = z.object({ id: TaskSchema.shape.id });

@prefix('tasks')
export default class TaskController {
  @operation({ summary: 'List tasks', description: "Returns the caller's tasks, oldest first." })
  @get()
  @authGuard()
  static listTasks = procedure({
    output: TaskSchema.array(),
  }).handle((req) => TaskService.listTasks(req.vovk.meta<AuthMeta>().userId));

  @operation({ summary: 'Create task', description: 'Creates a task with the given title. New tasks are not done.' })
  @post()
  @authGuard()
  static createTask = procedure({
    body: TaskSchema.pick({ title: true }),
    output: TaskSchema,
  }).handle(async (req) => {
    const { title } = await req.vovk.body();
    return TaskService.createTask(req.vovk.meta<AuthMeta>().userId, title);
  });

  @operation({ summary: 'Update task', description: 'Renames a task or marks it done or not done.' })
  @patch('{id}')
  @authGuard()
  static updateTask = procedure({
    params: TaskIdSchema,
    body: TaskSchema.pick({ title: true, done: true }).partial(),
    output: TaskSchema,
  }).handle(async (req, { id }) => {
    return TaskService.updateTask(req.vovk.meta<AuthMeta>().userId, id, await req.vovk.body());
  });

  @operation({ summary: 'Delete task', description: 'Deletes a task and returns it.' })
  @del('{id}')
  @authGuard()
  static deleteTask = procedure({
    params: TaskIdSchema,
    output: TaskSchema,
  }).handle((req, { id }) => TaskService.deleteTask(req.vovk.meta<AuthMeta>().userId, id));
}
