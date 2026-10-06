import { deepStrictEqual, ok, rejects, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { HttpException, HttpStatus } from 'vovk';
import { createValidateOnClient } from 'vovk/create-validate-on-client';
import { fetcher } from 'vovk/fetcher';
import { ClientSweepRPC } from '../generated-client/index.ts';

const isHttpException = (statusCode: number, message: RegExp | string) => (error: unknown) => {
  ok(error instanceof HttpException, `Expected HttpException, got ${error}`);
  strictEqual(error.statusCode, statusCode);
  if (typeof message === 'string') strictEqual(error.message, message);
  else ok(message.test(error.message), `Expected ${message}, got "${error.message}"`);
  return true;
};

describe('Client sweep', () => {
  describe('path params', () => {
    for (const id of ['..', '.', '', '%2e', '%2E%2E']) {
      it(`Refuses ${JSON.stringify(id)} as a param value before sending the request`, async () => {
        await rejects(
          ClientSweepRPC.getUserPosts({ params: { id } }),
          isHttpException(HttpStatus.NULL, /Param "id" can't be empty, "\." or "\.\."/)
        );
        await rejects(async () => ClientSweepRPC.getUserPosts.getURL({ params: { id } }), HttpException);
      });
    }

    it('Keeps dots that are not a whole segment', async () => {
      deepStrictEqual(await ClientSweepRPC.getUserPosts({ params: { id: 'a..b' } }), { id: 'a..b' });
      deepStrictEqual(await ClientSweepRPC.getUserPosts({ params: { id: '...' } }), { id: '...' });
    });

    it('Reports a missing param before sending the request', async () => {
      await rejects(
        ClientSweepRPC.getUserPosts({ params: {} as { id: string } }),
        isHttpException(HttpStatus.NULL, /^Missing params: id in .*\/users\/\{id\}\/posts$/)
      );
      await rejects(
        ClientSweepRPC.getUserPosts({ params: { id: undefined as unknown as string } }),
        isHttpException(HttpStatus.NULL, /^Missing params: id/)
      );
    });

    it('Sends the query and params that validateOnClient returns', async () => {
      const validateOnClient = createValidateOnClient({
        validate: (input, _schema, { type }) => {
          if (type === 'query') return { ...(input as object), page: '2' };
          if (type === 'params') return { id: 'validated' };
          return input;
        },
      });

      const result = await ClientSweepRPC.getEcho({
        params: { id: 'raw' },
        query: { q: 'x' },
        validateOnClient,
      });

      deepStrictEqual(result, { id: 'validated', query: { q: 'x', page: '2' } });
    });
  });

  describe('apiRoot', () => {
    it('Treats a root without a leading slash as a path on the current origin', () => {
      const params = { id: '1' };
      strictEqual(
        ClientSweepRPC.getUserPosts.getURL({ apiRoot: 'api', params }),
        '/api/client-sweep/sweep/users/1/posts'
      );
      strictEqual(
        ClientSweepRPC.getUserPosts.getURL({ apiRoot: '/api/', params }),
        '/api/client-sweep/sweep/users/1/posts'
      );
      strictEqual(ClientSweepRPC.getUserPosts.getURL({ apiRoot: '', params }), '/client-sweep/sweep/users/1/posts');
      strictEqual(ClientSweepRPC.getUserPosts.getURL({ apiRoot: '/', params }), '/client-sweep/sweep/users/1/posts');
    });

    it('Keeps a root that names a host', () => {
      const params = { id: '1' };
      strictEqual(
        ClientSweepRPC.getUserPosts.getURL({ apiRoot: 'https://example.com/api/', params }),
        'https://example.com/api/client-sweep/sweep/users/1/posts'
      );
      strictEqual(
        ClientSweepRPC.getUserPosts.getURL({ apiRoot: '//cdn.example.com/api', params }),
        '//cdn.example.com/api/client-sweep/sweep/users/1/posts'
      );
    });
  });

  describe('request', () => {
    it('Sends no content-type without a body', async () => {
      deepStrictEqual(await ClientSweepRPC.getContentType(), { contentType: null });
      deepStrictEqual(await ClientSweepRPC.postContentType({ body: { hello: 'world' } }), {
        contentType: 'application/json',
      });
    });

    it('Sends a body to a procedure that declares a content type but no body schema', async () => {
      deepStrictEqual(ClientSweepRPC.postXml.schema.validation, { body: { 'x-contentType': ['application/xml'] } });
      deepStrictEqual(await ClientSweepRPC.postXml({ body: '<a/>' }), { xml: '<a/>', contentType: 'application/xml' });
      deepStrictEqual(await ClientSweepRPC.postImage({ body: new File(['png'], 'a.png', { type: 'image/png' }) }), {
        name: 'a.png',
        type: 'image/png',
        size: 3,
      });
    });

    it('Sends a string body as JSON when the procedure declares no text type', async () => {
      deepStrictEqual(await ClientSweepRPC.postJsonString({ body: 'hello' }), {
        body: 'hello',
        contentType: 'application/json',
      });
    });

    it('Sends a binary body as the type the procedure declares', async () => {
      const bytes = new Uint8Array([37, 80, 68, 70]);
      const pdf = { type: 'application/pdf', size: 4 };

      deepStrictEqual(await ClientSweepRPC.postPdf({ body: bytes }), pdf);
      deepStrictEqual(await ClientSweepRPC.postPdf({ body: bytes.buffer }), pdf);
      deepStrictEqual(await ClientSweepRPC.postPdf({ body: new Blob([bytes]) }), pdf);
      deepStrictEqual(
        await ClientSweepRPC.postOctet({ body: new File([bytes], 'a.pdf', { type: 'application/pdf' }) }),
        {
          type: 'application/octet-stream',
          size: 4,
        }
      );
      deepStrictEqual(await ClientSweepRPC.postImage({ body: bytes }), { name: 'file', type: 'image/*', size: 4 });
      deepStrictEqual(await ClientSweepRPC.postImage({ body: new File([bytes], 'a.png', { type: 'image/png' }) }), {
        name: 'a.png',
        type: 'image/png',
        size: 4,
      });
      // a file of another type is not relabelled, the server refuses it
      await rejects(
        ClientSweepRPC.postPdf({ body: new File([bytes], 'a.txt', { type: 'text/plain' }) }),
        isHttpException(415, 'Unsupported media type: text/plain')
      );
    });

    it('Sends a string body as the text type the procedure declares', async () => {
      deepStrictEqual(await ClientSweepRPC.postLines({ body: '{"a":1}\n{"a":2}\n' }), {
        contentType: 'application/jsonl',
        body: '{"a":1}\n{"a":2}\n',
      });
    });

    it('Sends a Date in the query as an ISO string', async () => {
      const result = await ClientSweepRPC.getQueryEcho({
        query: { since: new Date(0), nested: { at: new Date(1000) } },
      });

      deepStrictEqual(result, { since: '1970-01-01T00:00:00.000Z', nested: { at: '1970-01-01T00:00:01.000Z' } });
    });

    it('Numbers query array items consecutively, leaving out the empty ones', async () => {
      const query = {
        tags: ['a', null, 'b'],
        ids: [undefined, '2'],
        items: [{}, { id: '1' }],
        matrix: [[], ['x']],
        dates: [new Date('invalid'), new Date(0)],
        rows: [{ a: null }, { a: '1' }],
      };

      deepStrictEqual(await ClientSweepRPC.getQuery({ query }), {
        tags: ['a', 'b'],
        ids: ['2'],
        items: [{ id: '1' }],
        matrix: [['x']],
        dates: ['1970-01-01T00:00:00.000Z'],
        rows: [{ a: '1' }],
      });
      ok(
        ClientSweepRPC.getQuery.getURL({ query: { tags: ['a', null, 'b'] } }).endsWith('?tags%5B0%5D=a&tags%5B1%5D=b')
      );
    });

    it('Sends a query value with toJSON as its JSON form', async () => {
      class Money {
        amount = 5;
        currency = 'EUR';
        toJSON() {
          return `${this.amount} ${this.currency}`;
        }
      }
      const query = {
        price: new Money(),
        link: new URL('https://example.com/a?b=c'),
        since: { $y: 2026, $M: 9, toJSON: () => '2026-10-01' },
        range: { toJSON: () => ({ from: 1, to: [2, 3] }) },
      };

      deepStrictEqual(await ClientSweepRPC.getQuery({ query }), {
        price: '5 EUR',
        link: 'https://example.com/a?b=c',
        since: '2026-10-01',
        range: { from: '1', to: ['2', '3'] },
      });
    });

    it('Sends a lone surrogate in the query or a param as U+FFFD', async () => {
      // a string cut inside an emoji, which encodeURIComponent refuses
      const cut = '👋'.slice(0, 1);

      deepStrictEqual(await ClientSweepRPC.getQuery({ query: { q: `a${cut}`, [cut]: 'x' } }), {
        q: 'a\uFFFD',
        '\uFFFD': 'x',
      });
      deepStrictEqual(await ClientSweepRPC.getUserPosts({ params: { id: `a${cut}` } }), { id: 'a\uFFFD' });
    });

    it('Converts an object body to form fields', async () => {
      const result = await ClientSweepRPC.postFormEntries({
        body: {
          name: 'a',
          nickname: undefined,
          bio: null,
          meta: { x: 1 },
          tags: ['a', 'b', null],
          when: new Date(0),
          file: new File(['x'], 'a.txt'),
          count: 5,
          flag: false,
        },
      });

      deepStrictEqual(result, [
        ['name', 'a'],
        ['meta', '{"x":1}'],
        ['tags', 'a'],
        ['tags', 'b'],
        ['when', '1970-01-01T00:00:00.000Z'],
        ['file', 'file:a.txt'],
        ['count', '5'],
        ['flag', 'false'],
      ]);
    });

    it('Sends an object body as JSON when the procedure also takes JSON, and as a form when it holds a file', async () => {
      deepStrictEqual(await ClientSweepRPC.postJsonOrForm({ body: { n: 1, tags: ['a'], nested: { a: true } } }), {
        body: { n: 1, tags: ['a'], nested: { a: true } },
        contentType: 'application/json',
      });
      deepStrictEqual(await ClientSweepRPC.postJsonOrForm({ body: { file: new File(['x'], 'a.txt') } }), {
        body: { file: 'file:a.txt' },
        contentType: 'multipart/form-data',
      });
    });

    it('Sends an object body urlencoded when the procedure takes only urlencoded', async () => {
      const result = await ClientSweepRPC.postUrlEncoded({ body: { hello: 'world', tags: ['a', 'b'] } });

      deepStrictEqual(result, {
        body: { hello: 'world', tags: ['a', 'b'] },
        contentType: 'application/x-www-form-urlencoded',
      });
    });
  });

  describe('responses', () => {
    const cases = [
      { name: 'a plain text error', call: () => ClientSweepRPC.getTextError(), status: 401, message: 'Unauthorized' },
      {
        name: 'an HTML error page',
        call: () => ClientSweepRPC.getHtmlError(),
        status: 502,
        message: '<html>502 Bad Gateway</html>',
      },
      {
        name: 'an empty error',
        call: () => ClientSweepRPC.getEmptyError(),
        status: 500,
        message: 'Internal Server Error',
      },
    ];

    for (const { name, call, status, message } of cases) {
      it(`Throws for ${name} and calls onError instead of onSuccess`, async () => {
        const successes: unknown[] = [];
        const errors: unknown[] = [];
        const unsubscribeSuccess = fetcher.onSuccess((data) => {
          successes.push(data);
        });
        const unsubscribeError = fetcher.onError((error) => {
          errors.push(error);
        });

        try {
          await rejects(call(), isHttpException(status, message));
        } finally {
          unsubscribeSuccess();
          unsubscribeError();
        }

        strictEqual(successes.length, 0);
        strictEqual(errors.length, 1);
      });
    }
  });

  describe('JSON Lines', () => {
    it('Delivers falsy items', async () => {
      const stream = await ClientSweepRPC.getFalsyItems();

      deepStrictEqual(await stream.asPromise(), [0, 1, false, null, '', 'x']);
    });

    it('Delivers data items that only look like the error line', async () => {
      const stream = await ClientSweepRPC.getErrorLikeItems();

      deepStrictEqual(await stream.asPromise(), [
        { isError: false, reason: 'not an error' },
        { isError: true, reason: 'not an error either', extra: 1 },
      ]);
    });

    it('Throws an HttpException with the status of the error line', async () => {
      const stream = await ClientSweepRPC.getErrorLineWithStatus();
      const items: unknown[] = [];

      await rejects(
        async () => {
          for await (const item of stream) items.push(item);
        },
        isHttpException(403, 'Forbidden')
      );

      deepStrictEqual(items, [{ n: 1 }]);
    });
  });

  describe('vovk-ajv', () => {
    it('Accepts a valid value for a format Ajv does not know', async () => {
      const id = 'cjld2cjxh0000qzrmn831i7rn';

      deepStrictEqual(await ClientSweepRPC.getByCuid({ params: { id } }), { id });
    });

    it('Still checks the pattern that comes with an unknown format', async () => {
      await rejects(
        ClientSweepRPC.getByCuid({ params: { id: 'not a cuid' } }),
        isHttpException(HttpStatus.NULL, /^Client-side validation failed\. Invalid params: data\/id must match pattern/)
      );
    });

    it('Accepts several Zod formats in a body', async () => {
      const body = {
        id: 'V1StGXR8_Z5jdHi6B-myT',
        phone: '+15555550123',
        token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.c2lnbmF0dXJl',
        color: 'ff00aa',
      };

      deepStrictEqual(await ClientSweepRPC.postFormats({ body }), body);
    });

    it('Validates a form body as the object before it becomes form data', async () => {
      const result = await ClientSweepRPC.postMultipartTyped({
        body: { age: 5, files: [new File(['x'], 'one.txt')] },
      });

      deepStrictEqual(result, { age: '5', files: ['file:one.txt'] });

      await rejects(
        ClientSweepRPC.postMultipartTyped({ body: { age: 'five' as unknown as number, files: [] } }),
        isHttpException(HttpStatus.NULL, /^Client-side validation failed\. Invalid body: data\/age must be number/)
      );
    });
  });
});
