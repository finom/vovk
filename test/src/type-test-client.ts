import { procedure, type VovkRequest } from 'vovk';
import { createRPC } from 'vovk/create-rpc';
import type { VovkFetcherOptions } from 'vovk/internal';

// Type checks for RPC modules: the test app's tsc run fails if a line without @ts-expect-error doesn't compile

// ====== A declared content type without a body schema ======

class ContentTypeController {
  static importXml = procedure({ contentType: 'application/xml' }).handle(async (req) => {
    const xml: string = await req.vovk.body();
    return { length: xml.length };
  });

  static uploadImage = procedure({ contentType: 'image/*' }).handle(async (req) => {
    const file: File = await req.vovk.body();
    return { size: file.size };
  });

  static ping = procedure().handle(async () => ({ ok: true }));
}

export async function contentTypeWithoutBodySchema(file: File) {
  const rpc = createRPC<typeof ContentTypeController, VovkFetcherOptions<unknown>>({}, '', 'ContentTypeRPC');

  await rpc.importXml({ body: '<a/>' });
  await rpc.importXml();
  await rpc.uploadImage({ body: file });
  await rpc.uploadImage({ body: new Uint8Array([1]) });
  // @ts-expect-error a binary content type takes no string
  await rpc.uploadImage({ body: 'text' });
  // @ts-expect-error a procedure with neither a body schema nor a declared content type takes no body
  await rpc.ping({ body: {} });
}

// ====== createRPC with one type argument ======

class PlainController {
  static list = procedure().handle(async () => [1, 2]);

  static getHello(_req: VovkRequest) {
    return { hello: 'world' };
  }

  static ping() {
    return { ok: true };
  }

  static plain = async (_req: VovkRequest<{ a: number }, { q: string }>) => ({ hello: 'world' });
}

export async function oneTypeArgument() {
  const rpc = createRPC<typeof PlainController>({}, '', 'PlainRPC');

  await rpc.list();
  await rpc.plain({ body: { a: 1 }, query: { q: 'x' }, apiRoot: '/api' });
}
