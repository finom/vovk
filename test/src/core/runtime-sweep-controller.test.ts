import { deepStrictEqual, ok, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { apiUrl, request } from '../lib.ts';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Runtime sweep over HTTP', () => {
  describe('Content-Type', () => {
    it('Rejects a header that lists several media types', async () => {
      // "text/plain" with a parameter is CORS-safelisted, a browser sends it cross-origin without a preflight
      const response = await request
        .post('/runtime-sweep/transfer')
        .set('content-type', 'text/plain; x=1,application/json')
        .send(JSON.stringify({ to: 'attacker', amount: 1000 }));

      strictEqual(response.status, 415);
    });

    it('Compares the media type case-insensitively', async () => {
      const response = await request
        .post('/runtime-sweep/transfer')
        .set('content-type', 'Application/JSON')
        .send(JSON.stringify({ to: 'friend', amount: 1 }));

      strictEqual(response.status, 200);
      deepStrictEqual(response.body, { executed: { to: 'friend', amount: 1 } });
    });

    it('Reads application/jsonl as a string', async () => {
      const lines = '{"a":1}\n{"a":2}\n';
      const response = await request.post('/runtime-sweep/lines').set('content-type', 'application/jsonl').send(lines);

      strictEqual(response.status, 200);
      deepStrictEqual(response.body, { body: lines });
    });

    it('Reads a +json-seq type as a string', async () => {
      const sequence = '\x1e{"a":1}\n';
      const response = await request
        .post('/runtime-sweep/json-seq')
        .set('content-type', 'application/geo+json-seq')
        .send(sequence);

      strictEqual(response.status, 200);
      deepStrictEqual(response.body, { body: sequence });
    });

    it('Answers a malformed JSON body with 400', async () => {
      const response = await request
        .post('/runtime-sweep/transfer')
        .set('content-type', 'application/json')
        .send('{"to":');

      strictEqual(response.status, 400);
      strictEqual(response.body.statusCode, 400);
    });
  });

  describe('Route params', () => {
    it('Gives every request its own params object', async () => {
      await request.get('/runtime-sweep/docs/42').set('x-role', 'admin');
      const response = await request.get('/runtime-sweep/docs/42');

      deepStrictEqual(response.body, { seenBefore: { id: '42' } });
    });

    it('Reads the params of a templated route requested by its literal template', async () => {
      const response = await request.get('/runtime-sweep/users/%7Bid%7D');

      deepStrictEqual(response.body, { params: { id: '{id}' } });
    });

    it('Passes the validated params as the second argument', async () => {
      const response = await request.get('/runtime-sweep/items/5');

      deepStrictEqual(response.body, { id: 5, type: 'number', viaReq: 5 });
    });

    it('Reads several params in one path segment', async () => {
      deepStrictEqual((await request.get('/runtime-sweep/range/1-5')).body, { from: '1', to: '5' });
      deepStrictEqual((await request.get('/runtime-sweep/files/report.v2.pdf')).body, {
        name: 'report.v2',
        ext: 'pdf',
      });
    });

    it('Appends the params of a procedure to an auto path', async () => {
      const response = await request.get('/runtime-sweep/get-user-by-id/123');

      strictEqual(response.status, 200);
      deepStrictEqual(response.body, { id: '123' });
    });
  });

  describe('Query', () => {
    it('Decodes + as a space', async () => {
      const response = await request.get(`/runtime-sweep/query?${new URLSearchParams({ q: 'new york' })}`);

      deepStrictEqual(response.body, { q: 'new york' });
    });
  });

  describe('JSON Lines', () => {
    it('Returns the generator once the client goes away', async () => {
      const abortController = new AbortController();
      const response = await fetch(`${apiUrl}/runtime-sweep/ticks`, { signal: abortController.signal });
      const reader = response.body?.getReader();
      ok(reader);

      let text = '';
      while (text.split('\n').length < 3) {
        const { value } = await reader.read();
        text += new TextDecoder().decode(value);
      }
      abortController.abort();

      await wait(500);
      const { body: state } = await request.get('/runtime-sweep/ticks-state');
      strictEqual(state.finalized, true);

      await wait(200);
      const { body: later } = await request.get('/runtime-sweep/ticks-state');
      strictEqual(later.produced, state.produced);
    });

    it('Sends the status code of an HttpException on the error line', async () => {
      const response = await fetch(`${apiUrl}/runtime-sweep/stream-forbidden`, {
        headers: { accept: 'application/jsonl' },
      });
      const lines = (await response.text())
        .split('\n')
        .filter(Boolean)
        .map((line) => JSON.parse(line));

      deepStrictEqual(lines, [{ n: 1 }, { isError: true, reason: 'Not yours', statusCode: 403 }]);
    });
  });

  describe('Responses', () => {
    it('Lets Next.js answer notFound() with 404', async () => {
      const response = await request.get('/runtime-sweep/not-found');

      strictEqual(response.status, 404);
    });

    it('Adds the decorator headers to a response with immutable headers', async () => {
      const response = await request.get('/runtime-sweep/redirect').redirects(0);

      strictEqual(response.status, 302);
      strictEqual(response.headers.location, 'https://example.com/elsewhere');
      strictEqual(response.headers['x-sweep'], 'redirect');
    });

    it('Answers HEAD from a GET route with its status and headers', async () => {
      const response = await request.head('/runtime-sweep/plain');

      strictEqual(response.status, 200);
      strictEqual(response.headers['x-sweep'], 'plain');
      strictEqual(response.headers['content-type'], 'application/json');
    });

    it('Answers a CORS preflight without running the auth hooks', async () => {
      const preflight = await request
        .options('/runtime-sweep/secure')
        .set('origin', 'https://app.example')
        .set('access-control-request-method', 'POST');

      strictEqual(preflight.status, 200);
      strictEqual(preflight.headers['access-control-allow-origin'], '*');

      const response = await request.post('/runtime-sweep/secure').send({});

      strictEqual(response.status, 401);
      strictEqual(response.headers['access-control-allow-origin'], '*');
    });
  });
});
