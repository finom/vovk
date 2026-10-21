import { HttpException, HttpStatus } from 'vovk';
import type { Task } from './task-schema';

// Tasks live in memory: they reset on restart, and serverless instances don't share them.
// Replace this map with your database; the controller and the MCP route stay the same.
const tasksByUser = new Map<string, Map<string, Task>>();

function getTasks(userId: string) {
  let tasks = tasksByUser.get(userId);
  if (!tasks) {
    tasks = new Map();
    tasksByUser.set(userId, tasks);
  }
  return tasks;
}

function getTask(userId: string, id: string) {
  const task = getTasks(userId).get(id);
  if (!task) throw new HttpException(HttpStatus.NOT_FOUND, `Task ${id} not found`);
  return task;
}

export default class TaskService {
  static listTasks(userId: string) {
    return [...getTasks(userId).values()];
  }

  static createTask(userId: string, title: string) {
    const task: Task = { id: crypto.randomUUID(), title, done: false, createdAt: new Date().toISOString() };
    getTasks(userId).set(task.id, task);
    return task;
  }

  static updateTask(userId: string, id: string, changes: Partial<Pick<Task, 'title' | 'done'>>) {
    const task = { ...getTask(userId, id), ...changes };
    getTasks(userId).set(id, task);
    return task;
  }

  static deleteTask(userId: string, id: string) {
    const task = getTask(userId, id);
    getTasks(userId).delete(id);
    return task;
  }
}
