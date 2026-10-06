import assert from 'node:assert';
import { describe, it } from 'node:test';
import { oneAtATime } from '../../../dist/utils/one-at-a-time.mjs';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

await describe('oneAtATime', async () => {
  await it('Runs once more after a run that was called during, with the newest state', async () => {
    let state = 'first';
    let running = 0;
    let maxRunning = 0;
    const seen: string[] = [];
    const generate = oneAtATime(async () => {
      running++;
      maxRunning = Math.max(maxRunning, running);
      const snapshot = state;
      await sleep(50);
      seen.push(snapshot);
      running--;
    });

    const first = generate();
    state = 'second';
    const second = generate();
    state = 'third';
    const third = generate();
    await Promise.all([first, second, third]);

    assert.deepStrictEqual(seen, ['first', 'third']);
    assert.strictEqual(maxRunning, 1);
  });

  await it('Starts a new run once the previous one has settled', async () => {
    let runs = 0;
    const generate = oneAtATime(async () => {
      runs++;
    });

    await generate();
    await generate();

    assert.strictEqual(runs, 2);
  });

  await it('Rejects only the calls of the run that fails', async () => {
    let runs = 0;
    const generate = oneAtATime(async () => {
      runs++;
      await sleep(20);
      if (runs === 1) throw new Error('broken template');
    });

    const first = generate();
    const second = generate();

    await assert.rejects(first, /broken template/);
    await second;
    assert.strictEqual(runs, 2);
  });
});
