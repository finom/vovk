import { ok } from 'node:assert';
import supertest from 'supertest';
import type { KnownAny } from 'vovk';

export const apiUrl = `http://localhost:${process.env.PORT}/api`;

export const request = supertest(apiUrl);

// legacy workaround to mimic Jest API
export function expectPromise(f: () => Promise<unknown>) {
  const promise = f();

  const getError = async () => {
    let error: Error | undefined;

    try {
      await promise;
    } catch (e) {
      error = e as Error;
    }
    if (!error) {
      throw new Error('Expected error, got none');
    }

    return error;
  };

  return {
    rejects: {
      toThrow: async (reg?: RegExp) => {
        const error = await getError();
        ok(
          reg ? reg.test(error?.message ?? 'NO MESSAGE') : error,
          `Expected error to match ${reg}, got ${error?.message}`
        );
      },
      toThrowError: async (cl: KnownAny) => {
        const error = await getError();
        ok(cl ? error instanceof cl : error, `Expected error to be instance of ${cl}, got ${error}`);
      },
    },
  };
}

export const NESTED_QUERY_EXAMPLE = {
  x: 'xx',
  y: ['yy', 'uu'],
  z: {
    f: 'x',
    u: ['uu', 'xx'],
    d: {
      x: 'ee',
      arrOfObjects: [
        {
          foo: 'bar',
          nestedArr: ['one', 'two', 'three'],
        },
        {
          foo: 'baz',
          nestedObj: {
            deepKey: 'deepValue',
          },
        },
      ],
    },
  },
};
