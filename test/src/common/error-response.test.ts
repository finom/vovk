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
}

type ControllerKey = Parameters<(typeof vovkApp.routes.GET)['set']>[0];

vovkApp.routes.GET.set(ErrorResponseController as unknown as ControllerKey, {
  internal: ErrorResponseController.internal,
  expected: ErrorResponseController.expected,
});

const call = async (route: string) => {
  const req = new Request(`http://localhost/api/${route}`);
  const response = await vovkApp.GET(req, { params: Promise.resolve({ vovk: [route] }) }, 'error-response-test');
  return { status: response.status, body: (await response.json()) as VovkErrorResponse };
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
});
