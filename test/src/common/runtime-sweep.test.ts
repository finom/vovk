import { deepStrictEqual, ok, rejects, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { forbidden, redirect, unauthorized } from 'next/dist/client/components/navigation.react-server.js';
import {
  get,
  HttpException,
  HttpStatus,
  initSegment,
  JSONLinesResponder,
  multitenant,
  post,
  procedure,
  type VovkRequest,
} from 'vovk';
import { z } from 'zod';

type Handlers = ReturnType<typeof initSegment>;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// dispatches as Next.js does for app/api/[[...vovk]]/route.ts, extra params come from dynamic parent folders
const call = (
  handlers: Handlers,
  method: keyof Handlers,
  url: string,
  init: RequestInit = {},
  parentParams: Record<string, string> = {}
) => {
  const req = new Request(`http://localhost/api/${url}`, { method, ...init });
  // NextRequest's nextUrl, req.vovk.query() reads it
  Object.defineProperty(req, 'nextUrl', { value: new URL(req.url) });
  // Next.js decodes each segment of the catch-all
  const path = new URL(req.url).pathname.split('/').slice(2).filter(Boolean).map(decodeURIComponent);
  const params = { ...parentParams, vovk: path } as Record<string, string[]>;
  return handlers[method](req, { params: Promise.resolve(params) });
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

// an HttpException thrown through another copy of vovk: another class with the same brand
class ForeignHttpException extends Error {
  statusCode = HttpStatus.PAYMENT_REQUIRED;
}
Object.defineProperty(ForeignHttpException.prototype, Symbol.for('vovk.HttpException'), { value: true });

describe('Runtime sweep', () => {
  describe('Errors', () => {
    class ErrorBrandController {
      static thirdParty() {
        // the shape of a payment SDK error: a numeric statusCode and an internal message and cause
        throw Object.assign(new Error('Invalid API Key provided: sk_live_****abcd'), {
          statusCode: 401,
          cause: { requestId: 'req_internal_123' },
        });
      }

      static foreign() {
        throw new ForeignHttpException('Not enough credits');
      }

      static async *streamExpected() {
        yield { n: 1 };
        throw new HttpException(HttpStatus.FORBIDDEN, 'Not yours');
      }

      static async *streamThirdParty() {
        yield { n: 1 };
        throw Object.assign(new Error('Upstream refused'), { statusCode: 401 });
      }
    }
    get('third-party')(ErrorBrandController, 'thirdParty');
    get('foreign')(ErrorBrandController, 'foreign');
    get('stream-expected')(ErrorBrandController, 'streamExpected');
    get('stream-third-party')(ErrorBrandController, 'streamThirdParty');
    const handlers = initSegment({ segmentName: 'error-brand', controllers: { ErrorBrandController } });

    it('Hides an error with a numeric statusCode that is no HttpException in production', async () => {
      await withNodeEnv('production', async () => {
        const response = await call(handlers, 'GET', 'third-party');

        strictEqual(response.status, 500);
        deepStrictEqual(await response.json(), { statusCode: 500, message: 'Internal server error', isError: true });
      });
    });

    it('Keeps an HttpException from another copy of the package in production', async () => {
      await withNodeEnv('production', async () => {
        const response = await call(handlers, 'GET', 'foreign');

        strictEqual(response.status, 402);
        deepStrictEqual(await response.json(), { statusCode: 402, message: 'Not enough credits', isError: true });
      });
    });

    it('Sends the status code of an HttpException on a stream error line in production', async () => {
      await withNodeEnv('production', async () => {
        const response = await call(handlers, 'GET', 'stream-expected');
        const lines = (await response.text())
          .split('\n')
          .filter(Boolean)
          .map((line) => JSON.parse(line));

        deepStrictEqual(lines, [{ n: 1 }, { isError: true, reason: 'Not yours', statusCode: 403 }]);
      });
    });

    it('Sends no status code on the error line of an error that is no HttpException', async () => {
      await withNodeEnv('development', async () => {
        const response = await call(handlers, 'GET', 'stream-third-party');
        const lines = (await response.text())
          .split('\n')
          .filter(Boolean)
          .map((line) => JSON.parse(line));

        deepStrictEqual(lines, [{ n: 1 }, { isError: true, reason: 'Upstream refused' }]);
      });
    });
  });

  describe('Error responses', () => {
    const errors: string[] = [];
    class FailureController {
      static bigInt() {
        return { n: 1n };
      }

      static bigIntCause() {
        throw new HttpException(HttpStatus.BAD_REQUEST, 'Bad input', { n: 1n });
      }

      static notModified() {
        throw new HttpException(HttpStatus.NOT_MODIFIED, '');
      }

      static noContent() {
        throw new HttpException(HttpStatus.NO_CONTENT, '');
      }

      static unknownStatus() {
        throw new HttpException(999 as HttpStatus, 'Unknown status');
      }

      static informationalStatus() {
        throw new HttpException(HttpStatus.CONTINUE, 'Informational status');
      }

      static throwString() {
        throw 'Plain string';
      }
    }
    get('big-int', { cors: true })(FailureController, 'bigInt');
    get('big-int-cause', { cors: true })(FailureController, 'bigIntCause');
    get('not-modified')(FailureController, 'notModified');
    get('no-content')(FailureController, 'noContent');
    get('unknown-status')(FailureController, 'unknownStatus');
    get('informational-status')(FailureController, 'informationalStatus');
    get('throw-string')(FailureController, 'throwString');
    const handlers = initSegment({
      segmentName: 'failure',
      controllers: { FailureController },
      onError: (error) => {
        errors.push(error.message);
      },
    });

    it('Answers a result JSON can not serialize with a JSON 500 that keeps the CORS headers', async () => {
      errors.length = 0;
      const response = await call(handlers, 'GET', 'big-int');

      strictEqual(response.status, 500);
      strictEqual(response.headers.get('access-control-allow-origin'), '*');
      deepStrictEqual(await response.json(), {
        statusCode: 500,
        message: 'Do not know how to serialize a BigInt',
        isError: true,
      });
      deepStrictEqual(errors, ['Do not know how to serialize a BigInt']);
    });

    it('Hides the serialization error of a result in production', async () => {
      await withNodeEnv('production', async () => {
        const response = await call(handlers, 'GET', 'big-int');

        strictEqual(response.status, 500);
        deepStrictEqual(await response.json(), { statusCode: 500, message: 'Internal server error', isError: true });
      });
    });

    it('Falls back to a plain JSON 500 when the cause of an HttpException can not be serialized', async () => {
      errors.length = 0;
      const response = await call(handlers, 'GET', 'big-int-cause');

      strictEqual(response.status, 500);
      strictEqual(response.headers.get('access-control-allow-origin'), '*');
      deepStrictEqual(await response.json(), {
        statusCode: 500,
        message: 'Do not know how to serialize a BigInt',
        isError: true,
      });
      deepStrictEqual(errors, ['Bad input', 'Do not know how to serialize a BigInt']);
    });

    it('Answers an HttpException with a null body status without a body', async () => {
      const notModified = await call(handlers, 'GET', 'not-modified');
      const noContent = await call(handlers, 'GET', 'no-content');

      strictEqual(notModified.status, 304);
      strictEqual(notModified.body, null);
      strictEqual(noContent.status, 204);
      strictEqual(noContent.body, null);
    });

    it('Answers an HttpException with a status outside 200-599 with 500', async () => {
      const unknown = await call(handlers, 'GET', 'unknown-status');
      const informational = await call(handlers, 'GET', 'informational-status');

      strictEqual(unknown.status, 500);
      deepStrictEqual(await unknown.json(), { statusCode: 500, message: 'Unknown status', isError: true });
      strictEqual(informational.status, 500);
      deepStrictEqual(await informational.json(), { statusCode: 500, message: 'Informational status', isError: true });
    });

    it('Sends a thrown value that is no Error as the message', async () => {
      const response = await call(handlers, 'GET', 'throw-string');

      strictEqual(response.status, 500);
      deepStrictEqual(await response.json(), { statusCode: 500, message: 'Plain string', isError: true });
    });
  });

  describe('Next.js navigation', () => {
    class NavigationController {
      static denied() {
        forbidden();
      }

      static unauthenticated() {
        unauthorized();
      }

      static moved() {
        redirect('/elsewhere');
      }
    }
    get('denied')(NavigationController, 'denied');
    get('unauthenticated')(NavigationController, 'unauthenticated');
    get('moved')(NavigationController, 'moved');
    const handlers = initSegment({ segmentName: 'navigation', controllers: { NavigationController } });

    it('Rethrows forbidden(), unauthorized() and redirect() for Next.js to answer', async () => {
      // forbidden() and unauthorized() need the authInterrupts flag next.config sets
      process.env.__NEXT_EXPERIMENTAL_AUTH_INTERRUPTS = 'true';
      await rejects(call(handlers, 'GET', 'denied'), { digest: 'NEXT_HTTP_ERROR_FALLBACK;403' });
      await rejects(call(handlers, 'GET', 'unauthenticated'), { digest: 'NEXT_HTTP_ERROR_FALLBACK;401' });
      await rejects(call(handlers, 'GET', 'moved'), (error: { digest?: string }) =>
        Boolean(error.digest?.startsWith('NEXT_REDIRECT'))
      );
    });
  });

  describe('Routing', () => {
    it('Answers a route conflict with a JSON error and calls onError', async () => {
      const errors: string[] = [];
      class ConflictController {
        static foo() {
          return {};
        }

        static bar() {
          return {};
        }
      }
      get('hello/{foo}')(ConflictController, 'foo');
      get('hello/{bar}')(ConflictController, 'bar');
      const handlers = initSegment({
        segmentName: 'conflict',
        controllers: { ConflictController },
        onError: (error) => {
          errors.push(error.message);
        },
      });

      const response = await call(handlers, 'GET', 'hello/1');

      strictEqual(response.status, 500);
      deepStrictEqual(await response.json(), {
        statusCode: 500,
        message: 'Conflicting routes found: hello/{foo}, hello/{bar}',
        isError: true,
      });
      deepStrictEqual(errors, ['Conflicting routes found: hello/{foo}, hello/{bar}']);
    });

    it('Finds the catch-all under a dynamic parent folder', async () => {
      class LocalizedController {
        static users() {
          return [{ id: 1 }];
        }
      }
      get('users')(LocalizedController, 'users');
      const handlers = initSegment({ segmentName: 'localized', controllers: { LocalizedController } });

      // app/[lang]/api/[[...vovk]]/route.ts
      const response = await call(handlers, 'GET', 'users', {}, { lang: 'en' });

      strictEqual(response.status, 200);
      deepStrictEqual(await response.json(), [{ id: 1 }]);
    });

    it('Serves a controller listed in two segments from both, each with its own onError', async () => {
      const errors: string[] = [];
      class SharedController {
        static ping() {
          return { pong: true };
        }

        static fail() {
          throw new HttpException(HttpStatus.BAD_REQUEST, 'Failed');
        }
      }
      get('ping')(SharedController, 'ping');
      get('fail')(SharedController, 'fail');
      const v1 = initSegment({
        segmentName: 'v1',
        controllers: { SharedRPC: SharedController },
        onError: () => {
          errors.push('v1');
        },
      });
      const v2 = initSegment({
        segmentName: 'v2',
        controllers: { SharedRPC: SharedController },
        onError: () => {
          errors.push('v2');
        },
      });

      strictEqual((await call(v1, 'GET', 'ping')).status, 200);
      strictEqual((await call(v2, 'GET', 'ping')).status, 200);
      await call(v1, 'GET', 'fail');
      await call(v2, 'GET', 'fail');
      deepStrictEqual(errors, ['v1', 'v2']);
    });
  });

  describe('Responses', () => {
    let finalized = false;
    class ResponseController {
      static proxy() {
        // fetch() responses have immutable headers
        return fetch('data:application/json,{"upstream":true}');
      }

      static secure() {
        return { ok: true };
      }

      static async *ticks() {
        try {
          while (true) {
            yield { tick: true };
            await wait(5);
          }
        } finally {
          finalized = true;
        }
      }
    }
    get('proxy', { cors: true })(ResponseController, 'proxy');
    post('secure', { cors: true })(ResponseController, 'secure');
    get('ticks')(ResponseController, 'ticks');
    const handlers = initSegment({
      segmentName: 'responses',
      controllers: { ResponseController },
      onBefore: (req) => {
        if (!req.headers.get('authorization')) throw new HttpException(HttpStatus.UNAUTHORIZED, 'Unauthorized');
      },
    });
    const authorized = { headers: { authorization: 'Bearer token' } };

    it('Adds the CORS headers to a fetch() response', async () => {
      const response = await call(handlers, 'GET', 'proxy', authorized);

      strictEqual(response.status, 200);
      strictEqual(response.headers.get('access-control-allow-origin'), '*');
      deepStrictEqual(await response.json(), { upstream: true });
    });

    it('Skips the segment onBefore for the CORS preflight', async () => {
      const preflight = await call(handlers, 'OPTIONS', 'secure');

      strictEqual(preflight.status, 200);
      strictEqual(preflight.headers.get('access-control-allow-origin'), '*');
      strictEqual((await call(handlers, 'POST', 'secure')).status, 401);
    });

    it('Answers HEAD from a generator GET route and returns the generator', async () => {
      finalized = false;
      const response = await call(handlers, 'HEAD', 'ticks', authorized);

      strictEqual(response.status, 200);
      strictEqual(response.body, null);
      await wait(50);
      strictEqual(finalized, true);
    });

    it('Returns the generator when onSuccess throws', async () => {
      let isReturned = false;
      class FailingOnSuccessController {
        static async *ticks() {
          try {
            while (true) {
              yield { tick: true };
              await wait(5);
            }
          } finally {
            isReturned = true;
          }
        }
      }
      get('ticks')(FailingOnSuccessController, 'ticks');
      const failingHandlers = initSegment({
        segmentName: 'failing-on-success',
        controllers: { FailingOnSuccessController },
        onSuccess: () => {
          throw new Error('onSuccess failed');
        },
      });

      const response = await call(failingHandlers, 'GET', 'ticks');

      strictEqual(response.status, 500);
      deepStrictEqual(await response.json(), { statusCode: 500, message: 'onSuccess failed', isError: true });
      await wait(50);
      strictEqual(isReturned, true);
    });
  });

  describe('JSON Lines streams', () => {
    let blobsProduced = 0;
    let ticksProduced = 0;
    let largeBlobsProduced = 0;
    let finalized = false;
    class StreamController {
      static async *blobs() {
        while (true) {
          blobsProduced++;
          yield { blob: 'x'.repeat(100_000) };
        }
      }

      static async *largeBlobs() {
        while (true) {
          largeBlobsProduced++;
          yield { blob: 'x'.repeat(1_000_000) };
        }
      }

      static async *ticks() {
        try {
          while (true) {
            ticksProduced++;
            yield { tick: ticksProduced };
            await wait(5);
          }
        } finally {
          finalized = true;
        }
      }
    }
    get('blobs')(StreamController, 'blobs');
    get('large-blobs')(StreamController, 'largeBlobs');
    get('ticks')(StreamController, 'ticks');
    const handlers = initSegment({ segmentName: 'streams', controllers: { StreamController } });

    it('Stops pulling from a generator while the client reads slower than it yields', async () => {
      const response = await call(handlers, 'GET', 'blobs');
      // the server piping the body holds a reader, a slow client keeps it from reading
      const reader = response.body?.getReader();
      ok(reader);
      await wait(300);

      ok(blobsProduced <= 3, `${blobsProduced} items of 100 KB produced for a client that read nothing`);
      await reader.cancel();
    });

    it('Bounds what a generator queues for a response that nothing reads', async () => {
      const response = await call(handlers, 'GET', 'large-blobs');
      await wait(300);

      ok(largeBlobsProduced <= 20, `${largeBlobsProduced} items of 1 MB queued for a response nothing reads`);
      await response.body?.cancel();
    });

    it('Returns the generator when the client cancels the body', async () => {
      finalized = false;
      const response = await call(handlers, 'GET', 'ticks');
      const reader = response.body?.getReader();
      ok(reader);
      await reader.read();
      await reader.read();
      await reader.cancel();
      await wait(50);

      strictEqual(finalized, true);
      const producedAtFinalize = ticksProduced;
      await wait(50);
      strictEqual(ticksProduced, producedAtFinalize);
    });

    it('Returns the generator when the request is aborted', async () => {
      finalized = false;
      const abortController = new AbortController();
      const response = await call(handlers, 'GET', 'ticks', { signal: abortController.signal });
      const reader = response.body?.getReader();
      ok(reader);
      await reader.read();
      await reader.read();
      abortController.abort();
      await wait(50);

      strictEqual(finalized, true);
    });
  });

  describe('JSON Lines responder', () => {
    const errors: string[] = [];
    let isClosedAfterClose = false;
    let finalized = false;
    class ResponderController {
      static throwAfterSend(req: VovkRequest) {
        const responder = new JSONLinesResponder<{ n: number | string }>(req);
        void responder.send({ n: 1 });
        void responder.throw(new Error('boom'));
        void responder.send({ n: 'after throw' });
        return responder;
      }

      static sendAfterClose(req: VovkRequest) {
        const responder = new JSONLinesResponder<{ n: number }>(req);
        void responder.send({ n: 1 });
        void responder.close();
        isClosedAfterClose = responder.isClosed;
        void responder.send({ n: 2 });
        return responder;
      }

      static invalidItem = procedure({ iteration: z.object({ n: z.number() }) }).handle(async (req) => {
        const responder = new JSONLinesResponder<{ n: number }>(req);
        void (async () => {
          await responder.send({ n: 'one' } as unknown as { n: number });
          await responder.send({ n: 2 });
          await responder.close();
        })();
        return responder;
      });

      static async *bigIntItem() {
        try {
          yield { n: 1 };
          yield { n: 2n };
          yield { n: 3 };
        } finally {
          finalized = true;
        }
      }

      static async *undefinedItem() {
        yield 1;
        yield undefined;
        yield 3;
      }

      static async *throwCycle() {
        yield 1;
        const cycle: Record<string, unknown> = {};
        cycle.self = cycle;
        throw cycle;
      }
    }
    get('throw-after-send')(ResponderController, 'throwAfterSend');
    get('send-after-close')(ResponderController, 'sendAfterClose');
    get('invalid-item')(ResponderController, 'invalidItem');
    get('big-int-item')(ResponderController, 'bigIntItem');
    get('undefined-item')(ResponderController, 'undefinedItem');
    get('throw-cycle')(ResponderController, 'throwCycle');
    const handlers = initSegment({
      segmentName: 'responder',
      controllers: { ResponderController },
      onError: (error) => {
        errors.push(error.message);
      },
    });
    const readLines = async (response: Response) =>
      (await response.text())
        .split('\n')
        .filter(Boolean)
        .map((line) => JSON.parse(line));

    it('Writes the error line of throw() after the earlier sends and drops the later ones', async () => {
      const lines = await readLines(await call(handlers, 'GET', 'throw-after-send'));

      deepStrictEqual(lines, [{ n: 1 }, { isError: true, reason: 'boom' }]);
    });

    it('Drops a send after close()', async () => {
      const lines = await readLines(await call(handlers, 'GET', 'send-after-close'));

      deepStrictEqual(lines, [{ n: 1 }]);
      strictEqual(isClosedAfterClose, true);
    });

    it('Ends the stream and calls onError when a send fails validation', async () => {
      errors.length = 0;
      const lines = await readLines(await call(handlers, 'GET', 'invalid-item'));

      strictEqual(lines.length, 1);
      strictEqual(lines[0].isError, true);
      ok(lines[0].reason.startsWith('Validation failed. Invalid iteration #0'), lines[0].reason);
      deepStrictEqual(errors, [lines[0].reason]);
    });

    it('Ends the stream, calls onError and returns the generator when an item fails to serialize', async () => {
      errors.length = 0;
      const lines = await readLines(await call(handlers, 'GET', 'big-int-item'));
      await wait(10);

      deepStrictEqual(lines, [{ n: 1 }, { isError: true, reason: 'Do not know how to serialize a BigInt' }]);
      deepStrictEqual(errors, ['Do not know how to serialize a BigInt']);
      strictEqual(finalized, true);
    });

    it('Writes an undefined item as null, as the JSON response does', async () => {
      const response = await call(handlers, 'GET', 'undefined-item');

      strictEqual(await response.text(), '1\nnull\n3\n');
    });

    // the stream used to stay open, so a regression hangs without the timeout
    it('Ends the stream when the thrown value can not be serialized', { timeout: 1000 }, async () => {
      const lines = await readLines(await call(handlers, 'GET', 'throw-cycle'));

      deepStrictEqual(lines, [1, { isError: true, reason: '[object Object]' }]);
    });
  });

  describe('Validation', () => {
    it('Answers a wrong Content-Type with 415 before reading the body', async () => {
      let isBodyRead = false;
      class UploadController {
        static upload = procedure({ body: z.object({ a: z.string() }) }).handle(async () => ({}));
      }
      post('upload')(UploadController, 'upload');
      const handlers = initSegment({ segmentName: 'upload', controllers: { UploadController } });
      // a zero high water mark, so only a read pulls the body
      const body = new ReadableStream(
        {
          pull(controller) {
            isBodyRead = true;
            controller.enqueue(new TextEncoder().encode('{"a":"b"}'));
            controller.close();
          },
        },
        { highWaterMark: 0 }
      );

      const response = await call(handlers, 'POST', 'upload', {
        body,
        headers: { 'content-type': 'text/plain' },
        duplex: 'half',
      } as RequestInit);

      strictEqual(response.status, 415);
      strictEqual(isBodyRead, false);
    });

    it('Skips the declared content type of a procedure without a body schema for a request without a body', async () => {
      class PingController {
        static ping = procedure({ contentType: 'text/plain' }).handle(async () => ({ ok: true }));
      }
      post('ping')(PingController, 'ping');
      const handlers = initSegment({ segmentName: 'typed-ping', controllers: { PingController } });

      strictEqual((await call(handlers, 'POST', 'ping')).status, 200);
      strictEqual(
        (await call(handlers, 'POST', 'ping', { headers: { 'content-type': 'application/json' }, body: '{}' })).status,
        415
      );
    });

    it('Passes the validated params to the handler through fn()', async () => {
      const getItem = procedure({ params: z.object({ id: z.coerce.number() }) }).handle(async (_req, params) => params);

      deepStrictEqual(await getItem.fn({ params: { id: '5', ownerId: 'someone-else' } as unknown as { id: number } }), {
        id: 5,
      });
    });
  });

  describe('Query', () => {
    class SearchController {
      static search(req: VovkRequest) {
        return req.vovk.query();
      }
    }
    get('search')(SearchController, 'search');
    const handlers = initSegment({ segmentName: 'search', controllers: { SearchController } });

    it('Answers a malformed percent-encoding with 400', async () => {
      const response = await call(handlers, 'GET', 'search?q=%E0%A4%A');

      strictEqual(response.status, 400);
      deepStrictEqual(await response.json(), {
        statusCode: 400,
        message: 'Malformed query string: %E0%A4%A',
        isError: true,
      });
    });

    it('Decodes + as a space', async () => {
      const response = await call(handlers, 'GET', `search?${new URLSearchParams({ q: 'new york', tag: 'a+b' })}`);

      deepStrictEqual(await response.json(), { q: 'new york', tag: 'a+b' });
    });
  });

  describe('multitenant', () => {
    it('Treats an empty from as the prefix of every path', () => {
      const result = multitenant({
        requestUrl: 'https://admin.example.com/settings/users?tab=2',
        requestHost: 'admin.example.com',
        targetHost: 'example.com',
        overrides: {
          admin: [
            { from: 'api', to: 'api/admin' },
            { from: '', to: 'admin' },
          ],
        },
      });

      strictEqual(result.action, 'rewrite');
      strictEqual(result.destination, 'https://admin.example.com/admin/settings/users?tab=2');
    });
  });
});
