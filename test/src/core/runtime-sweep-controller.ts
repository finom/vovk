import { notFound } from 'next/navigation.js';
import { get, HttpException, HttpStatus, post, prefix, procedure, type VovkRequest } from 'vovk';
import { z } from 'zod';

const ticks = { produced: 0, finalized: false };

@prefix('runtime-sweep')
export default class RuntimeSweepController {
  @post('transfer')
  static transfer = procedure({
    body: z.object({ to: z.string(), amount: z.number() }),
  }).handle(async (req) => ({ executed: await req.vovk.body() }));

  @post('form')
  static form = procedure({
    contentType: 'multipart/form-data',
    body: z.object({ a: z.string() }),
  }).handle(async (req) => req.vovk.body());

  @post('lines')
  static lines = procedure({
    contentType: 'application/jsonl',
    body: z.string(),
  }).handle(async (req) => ({ body: await req.vovk.body() }));

  @post('json-seq')
  static jsonSeq = procedure({
    contentType: 'application/geo+json-seq',
    body: z.string(),
  }).handle(async (req) => ({ body: await req.vovk.body() }));

  @post('typed-without-body')
  static typedWithoutBody = procedure({
    contentType: 'text/plain',
  }).handle(async () => ({ ok: true }));

  @post('clone')
  static cloneValidated = procedure({
    body: z.object({ title: z.string() }),
  }).handle(async (req) => ({ cloned: await req.clone().json() }));

  @get('docs/{id}')
  static readDocs(req: VovkRequest, params: Record<string, string>) {
    const seenBefore = { ...params };
    // a handler that annotates its params must not change the next request's
    if (req.headers.get('x-role') === 'admin') params.scope = 'all';
    return { seenBefore };
  }

  @get('users/{id}')
  static getUser(_req: VovkRequest, params: Record<string, string>) {
    return { params };
  }

  @get('items/{id}')
  static getItem = procedure({
    params: z.object({ id: z.coerce.number() }),
  }).handle(async (req, params) => ({ id: params.id, type: typeof params.id, viaReq: req.vovk.params().id }));

  @get('range/{from}-{to}')
  static getRange(_req: VovkRequest, params: Record<string, string>) {
    return params;
  }

  @get('files/{name}.{ext}')
  static getFile(_req: VovkRequest, params: Record<string, string>) {
    return params;
  }

  @get.auto()
  static getUserById = procedure({
    params: z.object({ id: z.string() }),
  }).handle(async (_req, { id }) => ({ id }));

  @get('query')
  static getQuery(req: VovkRequest<unknown, Record<string, unknown>>) {
    return req.vovk.query();
  }

  @get('ticks')
  static async *getTicks() {
    try {
      while (true) {
        ticks.produced++;
        yield { tick: ticks.produced };
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    } finally {
      ticks.finalized = true;
    }
  }

  @get('ticks-state')
  static getTicksState() {
    return ticks;
  }

  @get('stream-forbidden')
  static async *streamForbidden() {
    yield { n: 1 };
    throw new HttpException(HttpStatus.FORBIDDEN, 'Not yours');
  }

  @get('not-found')
  static getMissing() {
    notFound();
  }

  @get('redirect', { headers: { 'x-sweep': 'redirect' } })
  static redirectElsewhere() {
    return Response.redirect('https://example.com/elsewhere', 302);
  }

  @get('plain', { headers: { 'x-sweep': 'plain' } })
  static getPlain() {
    return { ok: true };
  }

  @post('secure', {
    cors: true,
    before() {
      throw new HttpException(HttpStatus.UNAUTHORIZED, 'Unauthorized');
    },
  })
  static secure() {
    return { ok: true };
  }
}
