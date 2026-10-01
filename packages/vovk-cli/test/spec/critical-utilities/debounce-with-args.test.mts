import assert from 'node:assert';
import { describe, it } from 'node:test';
import { debounceWithArgs } from '../../../dist/utils/debounce-with-args.mjs';

// a promise that never settles would hang the test, so it fails after a while instead
async function settleWithin<T>(promise: Promise<T>, ms = 2000): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => reject(new Error(`Not settled in ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

await describe('debounceWithArgs', async () => {
  await it('Settles a superseded call with the result of the call that runs', async () => {
    const calls: string[] = [];
    const requestSchema = debounceWithArgs(async (segmentName: string) => {
      calls.push(segmentName);
      return `schema of "${segmentName}"`;
    }, 20);

    const first = requestSchema('');
    const second = requestSchema('');
    const other = requestSchema('foo');

    assert.deepStrictEqual(await settleWithin(Promise.all([first, second, other])), [
      'schema of ""',
      'schema of ""',
      'schema of "foo"',
    ]);
    assert.deepStrictEqual(calls.toSorted(), ['', 'foo']);
  });

  await it('Rejects every waiting call when the call fails', async () => {
    const failing = debounceWithArgs(async () => {
      throw new Error('fetch failed');
    }, 20);

    const results = await settleWithin(Promise.allSettled([failing(), failing()]));

    assert.deepStrictEqual(
      results.map((result) => result.status),
      ['rejected', 'rejected']
    );
  });

  await it('Runs again for a call made while the previous one runs', async () => {
    let runs = 0;
    const slow = debounceWithArgs(async () => {
      const run = ++runs;
      await new Promise((resolve) => setTimeout(resolve, 50));
      return run;
    }, 10);

    const first = slow();
    await new Promise((resolve) => setTimeout(resolve, 20));
    const second = slow();

    assert.deepStrictEqual(await settleWithin(Promise.all([first, second])), [1, 2]);
  });
});
