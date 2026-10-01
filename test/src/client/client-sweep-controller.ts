import { get, JSONLinesResponder, post, prefix, procedure, type VovkRequest } from 'vovk';
import { z } from 'zod';

// zod >=4.4 is sideEffects: false, so Next.js tree-shakes the default locale init; load the English locale explicitly
z.config(z.locales.en());

const describeEntry = (value: FormDataEntryValue) => (value instanceof File ? `file:${value.name}` : value);

@prefix('sweep')
export default class ClientSweepController {
  @get('users/{id}/posts')
  static getUserPosts(_req: VovkRequest, { id }: { id: string }) {
    return { id };
  }

  @get('echo/{id}')
  static getEcho = procedure({
    params: z.object({ id: z.string() }),
    query: z.object({ q: z.string(), page: z.string().optional() }),
  }).handle((req, { id }) => ({ id, query: req.vovk.query() }));

  @get('query-echo')
  static getQueryEcho(req: VovkRequest<null, { since?: Date | string; nested?: { at: Date | string } }>) {
    return req.vovk.query();
  }

  @get('content-type')
  static getContentType(req: VovkRequest) {
    return { contentType: req.headers.get('content-type') };
  }

  @post('lines')
  static postLines = procedure({
    contentType: 'application/jsonl',
    body: z.string(),
  }).handle(async (req) => ({ contentType: req.headers.get('content-type'), body: await req.vovk.body() }));

  @post('content-type')
  static postContentType(req: VovkRequest<{ hello: string }>) {
    return { contentType: req.headers.get('content-type') };
  }

  // a declared content type without a body schema, as on the /content-type docs page
  @post('xml')
  static postXml = procedure({ contentType: 'application/xml' }).handle(async (req) => {
    const xml: string = await req.vovk.body();
    return { xml, contentType: req.headers.get('content-type') };
  });

  @post('image')
  static postImage = procedure({ contentType: 'image/*' }).handle(async (req) => {
    const file: File = await req.vovk.body();
    return { name: file.name, type: file.type, size: file.size };
  });

  @post('pdf')
  static postPdf = procedure({ contentType: 'application/pdf' }).handle(async (req) => {
    const file: File = await req.vovk.body();
    return { type: file.type, size: file.size };
  });

  @post('octet')
  static postOctet = procedure({ contentType: 'application/octet-stream' }).handle(async (req) => {
    const file: File = await req.vovk.body();
    return { type: file.type, size: file.size };
  });

  @post('json-string')
  static postJsonString = procedure({ body: z.string() }).handle(async (req) => ({
    body: await req.vovk.body(),
    contentType: req.headers.get('content-type'),
  }));

  @get('text-error')
  static getTextError() {
    return new Response('Unauthorized', { status: 401 });
  }

  @get('html-error')
  static getHtmlError() {
    return new Response('<html>502 Bad Gateway</html>', { status: 502, headers: { 'content-type': 'text/html' } });
  }

  @get('empty-error')
  static getEmptyError() {
    return new Response(null, { status: 500 });
  }

  @get('falsy-items')
  static async *getFalsyItems() {
    yield* [0, 1, false, null, '', 'x'];
  }

  @get('error-like-items')
  static getErrorLikeItems(req: VovkRequest) {
    const responder = new JSONLinesResponder<{ isError: boolean; reason: string; extra?: number }>(req);
    void (async () => {
      await responder.send({ isError: false, reason: 'not an error' });
      await responder.send({ isError: true, reason: 'not an error either', extra: 1 });
      await responder.close();
    })();
    return responder;
  }

  // the line a responder writes for an HttpException thrown mid-stream
  @get('error-line-with-status')
  static getErrorLineWithStatus(req: VovkRequest) {
    const responder = new JSONLinesResponder<{ n: number }>(req);
    void (async () => {
      await responder.send({ n: 1 });
      const errorLine = { isError: true as const, reason: 'Forbidden', statusCode: 403 };
      responder.sendLineOrError(errorLine);
      await responder.close();
    })();
    return responder;
  }

  @post('form-entries')
  static postFormEntries = procedure({
    contentType: 'multipart/form-data',
    body: z.record(z.string(), z.unknown()),
  }).handle(async (req) => {
    const form = await req.formData();
    return Array.from(form.entries(), ([key, value]) => [key, describeEntry(value)]);
  });

  @post('json-or-form')
  static postJsonOrForm = procedure({
    contentType: ['application/json', 'multipart/form-data'],
    body: z.union([
      z.object({ n: z.number(), tags: z.array(z.string()), nested: z.object({ a: z.boolean() }) }),
      z.object({ file: z.file() }),
    ]),
  }).handle(async (req) => {
    const body = await req.vovk.body();
    return {
      body: 'file' in body ? { file: describeEntry(body.file) } : body,
      contentType: req.headers.get('content-type')?.split(';')[0],
    };
  });

  @post('url-encoded')
  static postUrlEncoded = procedure({
    contentType: 'application/x-www-form-urlencoded',
    body: z.object({ hello: z.string(), tags: z.union([z.array(z.string()), z.string()]) }),
  }).handle(async (req) => ({ body: await req.vovk.body(), contentType: req.headers.get('content-type') }));

  // the server takes the form as sent, so only the client checks the typed object
  @post('multipart-typed')
  static postMultipartTyped = procedure({
    contentType: 'multipart/form-data',
    body: z.object({ age: z.coerce.number(), files: z.array(z.file()) }),
    disableServerSideValidation: ['body'],
  }).handle(async (req) => {
    const form = await req.formData();
    return { age: form.get('age'), files: form.getAll('files').map(describeEntry) };
  });

  @get('cuid/{id}')
  static getByCuid = procedure({
    params: z.object({ id: z.cuid() }),
  }).handle((_req, { id }) => ({ id }));

  @post('formats')
  static postFormats = procedure({
    body: z.object({ id: z.nanoid(), phone: z.e164(), token: z.jwt(), color: z.hex() }),
  }).handle(async (req) => req.vovk.body());
}
