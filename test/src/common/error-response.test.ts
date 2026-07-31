import { deepStrictEqual, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { HttpException, HttpStatus } from 'vovk';
import { type VovkErrorResponse, vovkApp } from 'vovk/internal';

// drives the dispatcher directly so NODE_ENV can be toggled per case
class ErrorResponseController {
  static _segmentName = 'error-response-test';
  static prefix = '';

  static internal = () => {
    throw new Error('connect ECONNREFUSED 10.0.3.14:5432', { cause: { host: 'internal-db.local' } });
  };

  static expected = () => {
    throw new HttpException(HttpStatus.PAYMENT_REQUIRED, 'Not enough credits', { need: 10 });
  };

  static streamInternal = async function* () {
    yield { n: 1 };
    throw new Error('connect ECONNREFUSED 10.0.3.14:5432');
  };

  static streamExpected = async function* () {
    yield { n: 1 };
    throw new HttpException(HttpStatus.PAYMENT_REQUIRED, 'Not enough credits');
  };
}

const onErrorCalls: string[] = [];
// biome-ignore lint/suspicious/noExplicitAny: matches the controller onError hook signature
(ErrorResponseController as any)._onError = (e: Error) => {
  onErrorCalls.push(e.message);
};

type ControllerKey = Parameters<(typeof vovkApp.routes.GET)['set']>[0];

vovkApp.routes.GET.set(ErrorResponseController as unknown as ControllerKey, {
  internal: ErrorResponseController.internal,
  expected: ErrorResponseController.expected,
  'stream-internal': ErrorResponseController.streamInternal,
  'stream-expected': ErrorResponseController.streamExpected,
});

const call = async (route: string) => {
  const req = new Request(`http://localhost/api/${route}`);
  const response = await vovkApp.GET(req, { params: Promise.resolve({ vovk: [route] }) }, 'error-response-test');
  return { status: response.status, body: (await response.json()) as VovkErrorResponse };
};

const callStream = async (route: string) => {
  const req = new Request(`http://localhost/api/${route}`);
  const response = await vovkApp.GET(req, { params: Promise.resolve({ vovk: [route] }) }, 'error-response-test');
  const lines = (await response.text())
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Record<string, unknown>);
  return { status: response.status, lines };
};

const withNodeEnv = async (value: string, fn: () => Promise<void>) => {
  // NODE_ENV is typed read-only by the next types, override it for the duration of the case
  const env = process.env as Record<string, string | undefined>;
  const original = env.NODE_ENV;
  env.NODE_ENV = value;
  try {
    await fn();
  } finally {
    env.NODE_ENV = original;
  }
};

describe('Error response details', () => {
  it('Hides the message and cause of an internal error in production', async () => {
    await withNodeEnv('production', async () => {
      const { status, body } = await call('internal');

      strictEqual(status, 500);
      deepStrictEqual(body, {
        statusCode: 500,
        message: 'Internal server error',
        isError: true,
      } satisfies VovkErrorResponse);
    });
  });

  it('Keeps an HttpException intact in production', async () => {
    await withNodeEnv('production', async () => {
      const { status, body } = await call('expected');

      strictEqual(status, 402);
      deepStrictEqual(body, {
        statusCode: 402,
        message: 'Not enough credits',
        cause: { need: 10 },
        isError: true,
      } satisfies VovkErrorResponse);
    });
  });

  it('Keeps internal error details outside production', async () => {
    await withNodeEnv('development', async () => {
      const { status, body } = await call('internal');

      strictEqual(status, 500);
      strictEqual(body.message, 'connect ECONNREFUSED 10.0.3.14:5432');
      deepStrictEqual(body.cause, { host: 'internal-db.local' });
    });
  });

  it('Hides the reason of an internal error thrown mid stream in production', async () => {
    await withNodeEnv('production', async () => {
      const { status, lines } = await callStream('stream-internal');

      // headers are already sent when a generator throws, so the status stays 200
      strictEqual(status, 200);
      deepStrictEqual(lines, [{ n: 1 }, { isError: true, reason: 'Internal server error' }]);
    });
  });

  it('Keeps an HttpException reason thrown mid stream', async () => {
    await withNodeEnv('production', async () => {
      const { lines } = await callStream('stream-expected');

      deepStrictEqual(lines, [{ n: 1 }, { isError: true, reason: 'Not enough credits' }]);
    });
  });

  it('Keeps a mid stream reason outside production', async () => {
    await withNodeEnv('development', async () => {
      const { lines } = await callStream('stream-internal');

      deepStrictEqual(lines, [{ n: 1 }, { isError: true, reason: 'connect ECONNREFUSED 10.0.3.14:5432' }]);
    });
  });

  it('Calls the controller onError hook when a generator throws', async () => {
    onErrorCalls.length = 0;
    await withNodeEnv('production', async () => {
      await callStream('stream-internal');
    });

    deepStrictEqual(onErrorCalls, ['connect ECONNREFUSED 10.0.3.14:5432']);
  });
});
