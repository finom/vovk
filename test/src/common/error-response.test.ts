import { deepStrictEqual, ok, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { HttpException, HttpStatus } from 'vovk';
import { createRPC } from 'vovk/create-rpc';
import { vovkApp } from '../../../packages/vovk/dist/core/vovk-app.js';
import type { VovkErrorResponse } from '../../../packages/vovk/dist/types/core.js';
import { validateOnClient } from '../../../packages/vovk-ajv/index.js';

// the schema a generated client carries for another API: GET customers/{id}, with a params schema
const billingSchema = {
  segments: {
    '': {
      segmentName: '',
      emitSchema: true,
      controllers: {
        BillingRPC: {
          rpcModuleName: 'BillingRPC',
          prefix: 'customers',
          handlers: {
            get: {
              path: '{id}',
              httpMethod: 'GET',
              validation: {
                params: { type: 'object', properties: { id: { type: 'string', pattern: '^cus_' } }, required: ['id'] },
              },
            },
          },
        },
      },
    },
  },
};
const BillingRPC = createRPC(billingSchema, '', 'BillingRPC', undefined, { validateOnClient }) as unknown as {
  get: (input: { params: { id: string }; apiRoot: string }) => Promise<unknown>;
};
// a credential in the API root, as a bot API takes it
const billingApiRoot = 'https://billing.example/bot123456:SECRET-TOKEN';

// drives the dispatcher directly so NODE_ENV can be toggled per case
class ErrorResponseController {
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

  // a handler that answers with what another API sent, through that API's vovk client
  static clientNetworkFailure = async () =>
    Response.json(await BillingRPC.get({ params: { id: 'cus_1' }, apiRoot: billingApiRoot }));

  static clientValidationFailure = async () =>
    Response.json(await BillingRPC.get({ params: { id: 'not-a-customer-7f3a' }, apiRoot: billingApiRoot }));

  static streamClientNetworkFailure = async function* () {
    yield { n: 1 };
    yield await BillingRPC.get({ params: { id: 'cus_1' }, apiRoot: billingApiRoot });
  };
}

const onErrorCalls: string[] = [];

type ControllerKey = Parameters<(typeof vovkApp.routes.GET)['set']>[0];

vovkApp.setSegment('error-response-test', {
  controllers: new Set([ErrorResponseController as unknown as ControllerKey]),
  onError: (e: Error) => {
    onErrorCalls.push(e.message);
  },
});

vovkApp.routes.GET.set(ErrorResponseController as unknown as ControllerKey, {
  internal: ErrorResponseController.internal,
  expected: ErrorResponseController.expected,
  'stream-internal': ErrorResponseController.streamInternal,
  'stream-expected': ErrorResponseController.streamExpected,
  'client-network-failure': ErrorResponseController.clientNetworkFailure,
  'client-validation-failure': ErrorResponseController.clientValidationFailure,
  'stream-client-network-failure': ErrorResponseController.streamClientNetworkFailure,
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

// fetch() as it fails when the host can't be reached
const withUnreachableHost = async (fn: () => Promise<void>) => {
  const original = globalThis.fetch;
  globalThis.fetch = () => Promise.reject(new TypeError('fetch failed'));
  try {
    await fn();
  } finally {
    globalThis.fetch = original;
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

      deepStrictEqual(lines, [{ n: 1 }, { isError: true, reason: 'Not enough credits', statusCode: 402 }]);
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

  it('Hides the URL and the credential of a vovk client call that failed to connect in production', async () => {
    await withUnreachableHost(() =>
      withNodeEnv('production', async () => {
        const { status, body } = await call('client-network-failure');
        const text = JSON.stringify(body);

        strictEqual(status, 500);
        ok(!text.includes('SECRET-TOKEN') && !text.includes('billing.example'), text);
      })
    );
  });

  it('Hides the URL and the credential of a vovk client call that failed to connect mid stream in production', async () => {
    await withUnreachableHost(() =>
      withNodeEnv('production', async () => {
        const { lines } = await callStream('stream-client-network-failure');
        const text = JSON.stringify(lines);

        deepStrictEqual(lines[0], { n: 1 });
        strictEqual(lines[1]?.isError, true);
        ok(!text.includes('SECRET-TOKEN') && !text.includes('billing.example'), text);
      })
    );
  });

  it('Hides the input and the URL of a failed client-side validation in production', async () => {
    await withUnreachableHost(() =>
      withNodeEnv('production', async () => {
        const { status, body } = await call('client-validation-failure');
        const text = JSON.stringify(body);

        strictEqual(status, 500);
        ok(!text.includes('not-a-customer-7f3a'), text);
        ok(!text.includes('SECRET-TOKEN') && !text.includes('billing.example'), text);
      })
    );
  });
});
