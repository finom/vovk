import { NextResponse } from 'next/server.js';
import {
  deriveTools,
  procedure,
  type StandardToolV0,
  ToModelOutput,
  type VovkBody,
  type VovkParams,
  type VovkQuery,
  type VovkRequest,
} from 'vovk';
import { createRPC } from 'vovk/create-rpc';
import { createFetcher } from 'vovk/fetcher';
// @ts-expect-error a module that isn't installed, as next is for a client bundle used without Next
import type { MissingResponse } from 'vovk-missing-module';
import { z } from 'zod';
import type { VovkFetcherOptions } from '../../packages/vovk/dist/types/client.js';

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

export async function disposableStream() {
  const rpc = createRPC<typeof GeneratorController>({}, '', 'GeneratorRPC');

  using stream = await rpc.noIteration({ query: { q: 'x' } });
  await using asyncStream = await rpc.noIteration({ query: { q: 'y' } });
  void [stream, asyncStream];
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

// ====== Input types: what the schemas accept, not what they output ======

class InputController {
  static list = procedure({
    query: z.object({ page: z.coerce.number().default(1), sort: z.enum(['asc', 'desc']).default('asc') }),
  }).handle(async (req) => req.vovk.query());

  static save = procedure({
    body: z.object({ tags: z.string().transform((tags) => tags.split(',')) }),
  }).handle(async (req) => req.vovk.body());

  static getItem = procedure({
    params: z.object({ id: z.coerce.number() }),
  }).handle(async (_req, { id }) => ({ id }));
}

export async function inputTypes() {
  const rpc = createRPC<typeof InputController>({}, '', 'InputRPC');

  await rpc.list({ query: {} });
  await rpc.list({ query: { page: '2', sort: 'desc' } });
  await rpc.save({ body: { tags: 'a,b' } });
  // @ts-expect-error the server takes the comma-separated string, the transform makes the array
  await rpc.save({ body: { tags: ['a', 'b'] } });
  await rpc.getItem({ params: { id: '1' } });

  await InputController.save.fn({ body: { tags: 'a,b' } });
  await InputController.list.fn({ query: {} });
  // the handler still gets the output
  const saved = await InputController.save.fn({ body: { tags: 'a,b' } });
  saved.tags satisfies string[];

  // the RPC method infers what it sends, the controller method what its handler gets
  ({ tags: 'a,b' }) satisfies VovkBody<typeof rpc.save>;
  ({ tags: ['a', 'b'] }) satisfies VovkBody<typeof InputController.save>;
}

// ====== Route params without a params schema ======

class RouteParamsController {
  static rename = procedure({ body: z.object({ name: z.string() }) }).handle(async (req, { id }) => ({
    id,
    ...(await req.vovk.body()),
  }));

  static remove = procedure().handle(async (_req, { id }) => ({ id }));
}

export async function routeParamsWithoutSchema() {
  const rpc = createRPC<typeof RouteParamsController>({}, '', 'RouteParamsRPC');

  // the route, as in put('{id}'), is not part of the type, so the method takes params as strings
  await rpc.rename({ params: { id: '42' }, body: { name: 'Ann' } });
  await rpc.remove({ params: { id: '42' } });
  rpc.remove.getURL({ params: { id: '42' } });
  ({ id: '42' }) satisfies VovkParams<typeof rpc.remove>;
}

// ====== Schemas whose input type is unknown ======

class UnknownInputController {
  static anyJson = procedure({ body: z.unknown() }).handle(async (req) => req.vovk.body());

  static anything = procedure({ body: z.any() }).handle(async (req) => req.vovk.body());

  static preprocessedBody = procedure({
    body: z.preprocess((value) => value, z.object({ name: z.string() })),
  }).handle(async (req) => req.vovk.body());

  static preprocessedQuery = procedure({
    query: z.preprocess((value) => value, z.object({ q: z.string() })),
  }).handle(async (req) => req.vovk.query());

  static preprocessedParams = procedure({
    params: z.preprocess((value) => value, z.object({ id: z.string() })),
  }).handle(async (req) => req.vovk.params());
}

export async function unknownInputTypes() {
  const rpc = createRPC<typeof UnknownInputController>({}, '', 'UnknownInputRPC');

  await rpc.anyJson({ body: { a: 1 } });
  await rpc.anyJson();
  await rpc.anything({ body: [1, 2] });
  // z.preprocess() takes anything, and passes it on to a schema that may reject a missing value
  await rpc.preprocessedBody({ body: { name: 'Ann' } });
  // @ts-expect-error the body is validated as undefined
  await rpc.preprocessedBody();
  await rpc.preprocessedQuery({ query: { q: 'x' } });
  // @ts-expect-error the query is validated as {}
  await rpc.preprocessedQuery();
  await rpc.preprocessedParams({ params: { id: '1' } });
  // @ts-expect-error the params are validated as {}
  await rpc.preprocessedParams();
}

// ====== Optional input: a key is optional when the server accepts the request without it ======

class OptionalInputController {
  static optionalBody = procedure({ body: z.object({ a: z.string() }).optional() }).handle(async (req) =>
    req.vovk.body()
  );

  static optionalQuery = procedure({ query: z.object({ q: z.string() }).optional() }).handle(async (req) =>
    req.vovk.query()
  );

  static allOptionalQuery = procedure({
    query: z.object({ q: z.string().optional(), page: z.coerce.number().default(1) }),
  }).handle(async (req) => req.vovk.query());

  static requiredQuery = procedure({ query: z.object({ q: z.string() }) }).handle(async (req) => req.vovk.query());

  static requiredBody = procedure({ body: z.object({ a: z.string() }) }).handle(async (req) => req.vovk.body());

  static plainSearch(req: VovkRequest<null, { q?: string }>) {
    return req.vovk.query();
  }
}

export async function optionalInput() {
  const rpc = createRPC<typeof OptionalInputController>({}, '', 'OptionalInputRPC');

  await rpc.optionalBody();
  await rpc.optionalBody({ body: { a: 'x' } });
  ({ a: 'x' }) satisfies VovkBody<typeof rpc.optionalBody>;
  await rpc.optionalQuery({ query: { q: 'x' } });
  // @ts-expect-error a request without a query string is validated as {}, which lacks q
  await rpc.optionalQuery();
  await rpc.allOptionalQuery();
  rpc.allOptionalQuery.getURL();
  ({ q: 'x' }) satisfies VovkQuery<typeof rpc.allOptionalQuery>;
  await rpc.plainSearch();

  // fn() validates what it gets the same way
  await OptionalInputController.optionalBody.fn();
  await OptionalInputController.allOptionalQuery.fn();
  await OptionalInputController.requiredQuery.fn({ query: { q: 'x' } });
  // @ts-expect-error the query is validated as {}
  await OptionalInputController.requiredQuery.fn();
  // @ts-expect-error the body is validated as undefined
  await OptionalInputController.requiredBody.fn();
}

// ====== Bodies of plain methods and OpenAPI mixins ======

class PlainBodyController {
  static text(req: VovkRequest<string>) {
    return req.vovk.body();
  }

  static textOrJson(req: VovkRequest<string | { a: number }>) {
    return req.vovk.body();
  }

  static maybeJson(req: VovkRequest<{ a: number } | undefined>) {
    return req.vovk.body();
  }
}

// a mixin's types, as the generated mixins.d.ts writes them for a text/plain request body
type MixinControllers = {
  sendText: (req: VovkRequest<string, null, null>) => Promise<{ ok: boolean }>;
};

export async function plainAndMixinBodies() {
  const rpc = createRPC<typeof PlainBodyController>({}, '', 'PlainBodyRPC');

  await rpc.text({ body: 'hello' });
  await rpc.textOrJson({ body: 'hello' });
  await rpc.textOrJson({ body: { a: 1 } });
  await rpc.maybeJson({ body: { a: 1 } });
  await rpc.maybeJson();

  const mixin = createRPC<MixinControllers>({}, '', 'MixinRPC');

  await mixin.sendText({ body: 'hello' });
}

// ====== Iterables a handler returns: the server streams any iterable object but an array ======

class ChunkStream implements AsyncIterable<{ delta: string }> {
  async *[Symbol.asyncIterator]() {
    yield { delta: 'a' };
  }
}

class IterableController {
  static tags() {
    return new Set(['a', 'b']);
  }

  static counts = procedure().handle(async () => new Map([['a', 1]]));

  static chunks = procedure().handle(async () => new ChunkStream());
}

export async function iterableResults() {
  const rpc = createRPC<typeof IterableController>({}, '', 'IterableRPC');

  const tags = await rpc.tags();
  (await tags.asPromise()) satisfies string[];
  const counts = await rpc.counts();
  (await counts.asPromise()) satisfies [string, number][];
  const chunks = await rpc.chunks();
  (await chunks.asPromise()) satisfies { delta: string }[];
  chunks.abortSilently();
}

// ====== Derived tools: execute always returns a promise ======

class ToolController {
  static getItem = procedure({ params: z.object({ id: z.string() }) }).handle(async (_req, { id }) => ({ id }));
}

export async function derivedTools() {
  const [tool] = deriveTools({ modules: { ToolController } });
  tool.execute({ params: { id: 'a' } }) satisfies Promise<unknown>;
  const [mcpTool] = deriveTools({ modules: { ToolController }, toModelOutput: ToModelOutput.MCP });
  (await mcpTool.execute({})).content satisfies unknown[];
  mcpTool.execute({}).then((output) => output.isError);
  // a derived tool is a standard tool
  [tool, mcpTool] satisfies StandardToolV0<{ body?: unknown; query?: unknown; params?: unknown }, unknown, unknown>[];
}
