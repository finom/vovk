import { NextResponse } from 'next/server.js';
import { createFetcher, procedure, type VovkRequest } from 'vovk';
import { createRPC } from 'vovk/create-rpc';
import type { VovkFetcherOptions } from 'vovk/internal';
// @ts-expect-error a module that isn't installed, as next is for a client bundle used without Next
import type { MissingResponse } from 'vovk-missing-module';
import { z } from 'zod';

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

// ====== Per-call options, and statics that are not handlers ======

class HelperController {
  static list = procedure().handle(async () => [1, 2]);

  static getHello(_req: VovkRequest) {
    return { hello: 'world' };
  }

  static ping() {
    return { ok: true };
  }

  static formatName(name: string) {
    return name.trim();
  }
}

export async function perCallOptionsAndHelpers() {
  const rpc = createRPC<typeof HelperController, VovkFetcherOptions<unknown>>({}, '', 'HelperRPC');

  await rpc.list({ fetcher: createFetcher() });
  await rpc.list({ validateOnClient: import('vovk-ajv') });
  await rpc.getHello();
  await rpc.ping();
  // @ts-expect-error a static that takes no request is not a handler, the RPC module has no such method
  rpc.formatName;
}

// ====== transform ======

class OutputController {
  static withOutput = procedure({ output: z.object({ n: z.number() }) }).handle(async () => ({ n: 1 }));
}

export async function transformToPrimitive() {
  const rpc = createRPC<typeof OutputController>({}, '', 'OutputRPC');

  const output = await rpc.withOutput();
  output.n satisfies number;
  const doubled = await rpc.withOutput({ transform: (data) => data.n * 2 });
  doubled satisfies number;
  const status = await rpc.withOutput({ transform: (_data, response) => response.status });
  status satisfies number;
  const label = await rpc.withOutput({ transform: () => 'label' as const });
  label satisfies 'label';
  const pair = await rpc.withOutput({ transform: (data, response) => [data, response] as const });
  pair[0].n satisfies number;
}

// ====== A generator without an iteration schema ======

class GeneratorController {
  static noIteration = procedure({ query: z.object({ q: z.string() }) }).handle(async function* () {
    yield { token: 'a' };
  });
}

export async function generatorWithoutIterationSchema() {
  const rpc = createRPC<typeof GeneratorController>({}, '', 'GeneratorRPC');

  const stream = await rpc.noIteration({ query: { q: 'x' } });
  const items = await stream.asPromise();
  items satisfies { token: string }[];
  stream.abortSilently();
  for await (const item of stream) item.token satisfies string;
  // @ts-expect-error the stream is not an async generator
  stream.next;
}

// ====== Response bodies ======

class ResponseController {
  // biome-ignore lint/suspicious/noExplicitAny: a handler typed any is not a stream
  static async anyResult(): Promise<any> {
    return { a: 1 };
  }

  static async nextJson() {
    return NextResponse.json({ hello: 'world' });
  }

  static async download() {
    return new Response('a,b', { headers: { 'content-type': 'text/csv' } });
  }
}

export async function responseBodies() {
  const rpc = createRPC<typeof ResponseController>({}, '', 'ResponseRPC');

  const anyResult = await rpc.anyResult();
  anyResult.a satisfies number;
  const json = await rpc.nextJson();
  json.hello satisfies string;
  // @ts-expect-error the body type, not a stream
  json.asPromise;
  const download = await rpc.download();
  download satisfies Response;
}

// a type from a module that isn't installed is the error type, an any that IsAny can't tell apart in a plain check
declare class MissingTypeController {
  static missing(): MissingResponse<{ hello: string }>;
  static missingPromise(): Promise<MissingResponse<{ hello: string }>>;
}

export async function unresolvedResponseType() {
  const rpc = createRPC<typeof MissingTypeController>({}, '', 'MissingRPC');

  const result = await rpc.missing();
  result.hello;
  const fromPromise = await rpc.missingPromise();
  fromPromise.hello;
}
