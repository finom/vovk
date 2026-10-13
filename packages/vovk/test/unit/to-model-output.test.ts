import { deepStrictEqual, ok, strictEqual } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import type { StandardToolV0 } from 'standard-tool';
import { deriveTools, HttpException, HttpStatus, procedure, ToModelOutput } from 'vovk';

const tool = {} as StandardToolV0<unknown, unknown, unknown>;

describe('ToModelOutput.MCP output', () => {
  it('Sends text content for a handler that returns nothing', async () => {
    const output = await ToModelOutput.MCP(undefined, tool, null);
    deepStrictEqual(output, { content: [{ type: 'text', text: '' }] });
  });

  it('Reads a +json response as JSON', async () => {
    const body = { data: { id: '1', type: 'things' } };
    const response = new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/vnd.api+json' } });
    deepStrictEqual(await ToModelOutput.MCP(response, tool, null), {
      content: [{ type: 'text', text: JSON.stringify(body) }],
      structuredContent: body,
    });
  });

  it('Reports a problem+json error response with its details', async () => {
    const problem = { type: 'about:blank', title: 'Not Found', status: 404, detail: 'No thing 1' };
    const response = new Response(JSON.stringify(problem), {
      status: 404,
      headers: { 'Content-Type': 'application/problem+json' },
    });
    deepStrictEqual(await ToModelOutput.MCP(response, tool, null), {
      content: [{ type: 'text', text: JSON.stringify(problem) }],
      isError: true,
    });
  });

  it('Reports any response with an error status as an error', async () => {
    const response = new Response('Service Unavailable', { status: 503, headers: { 'Content-Type': 'text/plain' } });
    deepStrictEqual(await ToModelOutput.MCP(response, tool, null), {
      content: [{ type: 'text', text: 'Service Unavailable' }],
      isError: true,
    });
  });

  it('Gives a JSON response that is not an object no structured content', async () => {
    const response = new Response('"done"', { headers: { 'Content-Type': 'application/json' } });
    deepStrictEqual(await ToModelOutput.MCP(response, tool, null), { content: [{ type: 'text', text: '"done"' }] });
  });
});

describe('ToModelOutput error messages in production', () => {
  // NODE_ENV is typed read-only by the next types
  const env = process.env as Record<string, string | undefined>;
  const nodeEnv = env.NODE_ENV;
  const consoleError = mock.fn();
  beforeEach(() => {
    env.NODE_ENV = 'production';
    consoleError.mock.resetCalls();
    mock.method(console, 'error', consoleError);
  });
  afterEach(() => {
    env.NODE_ENV = nodeEnv;
    mock.restoreAll();
  });

  const internal = new Error('connect ECONNREFUSED db.internal:5432');
  const expected = new HttpException(HttpStatus.NOT_FOUND, 'Thing 1 is not found');

  it('Hides the message of an internal error from the default output', async () => {
    deepStrictEqual(await ToModelOutput.DEFAULT(internal, tool, null), { error: 'Internal server error' });
    strictEqual(consoleError.mock.callCount(), 1, 'the error is logged on the server');
  });

  it('Hides the message of an internal error from the MCP output', async () => {
    deepStrictEqual(await ToModelOutput.MCP(internal, tool, null), {
      content: [{ type: 'text', text: 'Internal server error' }],
      isError: true,
    });
  });

  it('Hides the message of a third-party error that carries a statusCode', async () => {
    const sdkError = Object.assign(new Error('Invalid API Key provided: sk_live_123'), { statusCode: 401 });
    deepStrictEqual(await ToModelOutput.DEFAULT(sdkError, tool, null), { error: 'Internal server error' });
  });

  it('Keeps the message of an HttpException', async () => {
    deepStrictEqual(await ToModelOutput.DEFAULT(expected, tool, null), { error: 'Thing 1 is not found' });
    deepStrictEqual(await ToModelOutput.MCP(expected, tool, null), {
      content: [{ type: 'text', text: 'Thing 1 is not found' }],
      isError: true,
    });
    strictEqual(consoleError.mock.callCount(), 0);
  });

  it('Hides it from a derived tool and hands onError the original error', async () => {
    const onError = mock.fn();
    const [derived] = deriveTools({
      modules: {
        ThingModule: {
          getThing: procedure({ operationObject: { summary: 'Get thing' } }).handle(async () => {
            throw internal;
          }),
        },
      },
      onError,
    });
    deepStrictEqual(await derived.execute({}), { error: 'Internal server error' });
    strictEqual(onError.mock.calls[0].arguments[0], internal);
  });

  it('Keeps the message outside production', async () => {
    env.NODE_ENV = 'development';
    deepStrictEqual(await ToModelOutput.DEFAULT(internal, tool, null), { error: internal.message });
    strictEqual(consoleError.mock.callCount(), 0);
  });

  it('Hides the message of an internal error from the RAW output', async () => {
    const output = await ToModelOutput.RAW(internal, tool, null);
    ok(output instanceof HttpException);
    strictEqual(output.statusCode, HttpStatus.INTERNAL_SERVER_ERROR);
    strictEqual(output.message, 'Internal server error');
    strictEqual(consoleError.mock.callCount(), 1, 'the error is logged on the server');
  });

  it('Gives an HttpException back as it is from the RAW output', async () => {
    strictEqual(await ToModelOutput.RAW(expected, tool, null), expected);
    strictEqual(consoleError.mock.callCount(), 0);
  });

  it('Gives an internal error back as it is from the RAW output outside production', async () => {
    env.NODE_ENV = 'development';
    strictEqual(await ToModelOutput.RAW(internal, tool, null), internal);
  });
});

describe('ToModelOutput.RAW output', () => {
  it('Gives a value back as it is', async () => {
    const value = { orders: [{ id: 1 }] };
    strictEqual(await ToModelOutput.RAW(value, tool, null), value);
    strictEqual(await ToModelOutput.RAW(undefined, tool, null), undefined);
  });

  it('Reads the body of a JSON response', async () => {
    deepStrictEqual(await ToModelOutput.RAW(Response.json({ id: 1 }), tool, null), { id: 1 });
  });

  it('Gives an error status back as an HttpException with its status and message', async () => {
    const output = await ToModelOutput.RAW(
      Response.json({ message: 'Thing 1 is not found' }, { status: 404 }),
      tool,
      null
    );
    ok(output instanceof HttpException);
    strictEqual(output.statusCode, HttpStatus.NOT_FOUND);
    strictEqual(output.message, 'Thing 1 is not found');
  });
});
