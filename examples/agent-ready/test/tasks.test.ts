import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { GET, POST } from '@/app/api/[[...vovk]]/route';
import TaskController from '@/modules/task/task-controller';

const asUser = (userId: string) => ({ meta: { userId } });

beforeEach(() => {
  process.env.API_TOKENS = 'alice:token-alice,bob:token-bob';
});

describe('procedures called in-process, as the MCP route does', () => {
  it('keeps each user to their own tasks', async () => {
    const task = await TaskController.createTask.fn({ body: { title: 'Ship it' }, ...asUser('alice') });
    assert.equal(task.done, false);

    const alicesTasks = await TaskController.listTasks.fn(asUser('alice'));
    assert.ok(alicesTasks.some(({ id }) => id === task.id));
    const bobsTasks = await TaskController.listTasks.fn(asUser('bob'));
    assert.ok(!bobsTasks.some(({ id }) => id === task.id));

    await assert.rejects(
      TaskController.updateTask.fn({ params: { id: task.id }, body: { done: true }, ...asUser('bob') }),
      { statusCode: 404 }
    );
    const updated = await TaskController.updateTask.fn({
      params: { id: task.id },
      body: { done: true },
      ...asUser('alice'),
    });
    assert.equal(updated.done, true);
  });

  it('refuses a call without a user', async () => {
    await assert.rejects(TaskController.listTasks.fn(), { statusCode: 401 });
  });

  it('validates the input', async () => {
    await assert.rejects(TaskController.createTask.fn({ body: { title: '' }, ...asUser('alice') }), {
      statusCode: 400,
    });
  });
});

describe('HTTP', () => {
  const context = (...path: string[]) => ({ params: Promise.resolve({ vovk: path }) });
  const request = (method: string, token?: string, body?: unknown) =>
    new Request('http://localhost/api/tasks', {
      method,
      headers: { 'content-type': 'application/json', ...(token && { authorization: `Bearer ${token}` }) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

  it('answers 401 without a known token', async () => {
    assert.equal((await GET(request('GET'), context('tasks'))).status, 401);
    assert.equal((await GET(request('GET', 'wrong'), context('tasks'))).status, 401);
  });

  it('creates and lists tasks for the token owner', async () => {
    const created = await POST(request('POST', 'token-bob', { title: 'Write tests' }), context('tasks'));
    assert.equal(created.status, 200);
    const { id } = await created.json();

    const bobs = await (await GET(request('GET', 'token-bob'), context('tasks'))).json();
    assert.ok(bobs.some((task: { id: string }) => task.id === id));
    const alices = await (await GET(request('GET', 'token-alice'), context('tasks'))).json();
    assert.ok(!alices.some((task: { id: string }) => task.id === id));
  });
});
