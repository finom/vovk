import { procedure, type VovkBody, type VovkOutput, type VovkParams, type VovkRequest } from 'vovk';
import { createRPC } from 'vovk/create-rpc';
import { z } from 'zod';

// ====== Builder pattern tests (with output type checking) ======

// Test 1: Should error - return type doesn't match output
const test1 = procedure({
  output: z.object({ hello: z.string() }),
  // @ts-expect-error - return type doesn't match output
}).handle(async () => {
  return { hello: 123 }; // number instead of string - should error
});

// Test 2: Should be OK - return type matches output
const test2 = procedure({
  output: z.object({ hello: z.string() }),
}).handle(async () => {
  return { hello: 'world' };
});

// Test 3: Should be OK - no output, any return type (no args)
const test3 = procedure().handle(async () => {
  return { anything: 'works', num: 42 };
});

// Test 4: with body and output - correct
const test4 = procedure({
  body: z.object({ name: z.string() }),
  output: z.object({ greeting: z.string() }),
}).handle(async (req) => {
  const { name } = await req.vovk.body();
  return { greeting: `Hello ${name}` };
});

// Test 5: with body and output - wrong return
const test5 = procedure({
  body: z.object({ name: z.string() }),
  output: z.object({ greeting: z.string() }),
  // @ts-expect-error - return type doesn't match output
}).handle(async (req) => {
  const { name } = await req.vovk.body();
  return { wrongKey: `Hello ${name}` }; // should error - 'wrongKey' not in output
});

// ====== Circular reference tests ======

// Test 6: Service↔Controller circular reference (builder pattern should handle this)
class TestService {
  static doWork(input: {
    body: VovkBody<typeof TestController.myMethod>;
    params: VovkParams<typeof TestController.myMethod>;
  }) {
    return { greeting: `Hello ${input.body.name}`, id: input.params.id };
  }
}

class TestController {
  static myMethod = procedure({
    body: z.object({ name: z.string() }),
    params: z.object({ id: z.string() }),
    output: z.object({ greeting: z.string(), id: z.string() }),
  }).handle(async (req) => {
    const body = await req.vovk.body();
    const params = req.vovk.params();
    return TestService.doWork({ body, params });
  });
}

// Test 7: Self-reference with VovkOutput
const selfRef = procedure({
  output: z.object({ foo: z.string() }),
}).handle(async () => {
  return { foo: 'bar' } satisfies VovkOutput<typeof selfRef>;
});

// ====== Route params without a params schema ======

// Test 8: the handler's second argument and req.vovk.params() hold the route params as strings
const noParamsSchema = procedure({ query: z.object({ q: z.string() }) }).handle(async (req, params) => {
  const id: string = params.id;
  const fromReq: string = req.vovk.params().id;
  return { id, fromReq };
});

const noOptions = procedure().handle(async (_req, { id }) => {
  const value: string = id;
  return { value };
});

const withParamsSchema = procedure({ params: z.object({ id: z.coerce.number() }) }).handle(async (req, { id }) => {
  const value: number = id;
  const fromReq: number = req.vovk.params().id;
  return { value, fromReq };
});

// ====== searchParams: the raw URL values ======

// Test 9: a string field keeps its type; other fields arrive as strings, and an optional field or an array
// (sent as tags[0]=…) may be absent
const searchParamsTypes = procedure({
  query: z.object({
    notify: z.enum(['email', 'push', 'none']),
    page: z.coerce.number(),
    tags: z.array(z.string()),
    sort: z.string().optional(),
  }),
}).handle(async (req) => {
  const { searchParams } = req.nextUrl;
  searchParams.get('notify') satisfies 'email' | 'push' | 'none';
  searchParams.get('page') satisfies string;
  // @ts-expect-error the URL holds the string "2", the validated query holds the number
  searchParams.get('page') satisfies number;
  searchParams.get('tags') satisfies string | null;
  // @ts-expect-error tags go as tags[0]=…, so the key itself may be absent
  searchParams.get('tags') satisfies string;
  searchParams.get('sort') satisfies string | null;
  // @ts-expect-error an absent key gives null, not undefined
  searchParams.get('sort') satisfies string | undefined;
  searchParams.getAll('tags') satisfies string[];
  searchParams.has('sort') satisfies boolean;
  // @ts-expect-error the query schema has no such key
  searchParams.get('other');
  for (const [key, value] of searchParams.entries()) {
    key satisfies string;
    value satisfies string;
  }
  return null;
});

// Test 16: without a query schema, searchParams takes any key, as URLSearchParams does
const searchParamsWithoutSchema = procedure().handle(async (req) => {
  const { searchParams } = req.nextUrl;
  searchParams.get('page') satisfies string | null;
  // @ts-expect-error an absent key gives null
  searchParams.get('page') satisfies string;
  searchParams.getAll('tag') satisfies string[];
  searchParams.has('page') satisfies boolean;
  // @ts-expect-error without a query schema, req.vovk.query() is unknown
  req.vovk.query().page;
  return null;
});

class PlainSearchParams {
  static untyped(req: VovkRequest) {
    const { searchParams } = req.nextUrl;
    searchParams.get('page') satisfies string | null;
    searchParams.getAll('tag') satisfies string[];
    searchParams.has('page') satisfies boolean;
    return null;
  }

  static withoutQuery(req: VovkRequest<null, null>) {
    req.nextUrl.searchParams.get('page') satisfies string | null;
    return null;
  }

  // a query type keys searchParams and req.vovk.query() alike
  static typed(req: VovkRequest<null, { q?: string }>) {
    req.nextUrl.searchParams.get('q') satisfies string | null;
    req.vovk.query().q satisfies string | undefined;
    // @ts-expect-error the query type has no such key
    req.nextUrl.searchParams.get('other');
    // @ts-expect-error the query type has no such key
    req.vovk.query().other;
    return null;
  }
}

// ====== The raw request: what the client sent, before defaults and transforms ======

// Test 10: req.json() and searchParams read the request itself, req.vovk the validated values
const rawRequestTypes = procedure({
  body: z.object({ tags: z.string().transform((tags) => tags.split(',')) }),
  query: z.object({ sort: z.enum(['asc', 'desc']).default('asc') }),
}).handle(async (req) => {
  (await req.json()).tags satisfies string;
  (await req.vovk.body()).tags satisfies string[];
  req.nextUrl.searchParams.get('sort') satisfies 'asc' | 'desc' | null;
  // @ts-expect-error the URL may leave out a field that has a default
  req.nextUrl.searchParams.get('sort') satisfies 'asc' | 'desc';
  req.vovk.query().sort satisfies 'asc' | 'desc';
  return null;
});

// Test 11: with preferTransformed: false, req.vovk and the params argument hold the values as sent
const untransformedTypes = procedure({
  body: z.object({ tags: z.string().transform((tags) => tags.split(',')) }),
  query: z.object({ page: z.string().transform(Number) }),
  params: z.object({ id: z.string().transform(Number) }),
  preferTransformed: false,
}).handle(async (req, { id }) => {
  (await req.vovk.body()).tags satisfies string;
  req.vovk.query().page satisfies string;
  req.vovk.params().id satisfies string;
  id satisfies string;
  return null;
});

// ====== The output schema validates the handler's return as its input ======

const timestamped = z.object({ count: z.number().default(0), at: z.date().transform((date) => date.toISOString()) });

// Test 12: the handler returns what the schema takes, fn() and the client get what it makes
const returnsSchemaInput = procedure({ output: timestamped }).handle(async () => {
  return { at: new Date(0) };
});

const returnsSchemaOutput = procedure({
  output: timestamped,
  // @ts-expect-error the return is validated as the schema's input, which takes a Date
}).handle(async () => {
  return { count: 1, at: '1970-01-01T00:00:00.000Z' };
});

export async function outputSchemaTypes() {
  const result = await returnsSchemaInput.fn();
  result.at satisfies string;
  result.count satisfies number;
}

// ====== fn() returns a promise ======

// Test 13: fn() runs the handler through the async validation, so a sync handler's result comes as a promise too;
// with an iteration schema, the items come from an async generator that validates them
class FnResultController {
  static echo = procedure({ query: z.object({ q: z.string() }) }).handle((req) => ({ q: req.vovk.query().q }));

  static greeting = procedure({ output: z.object({ hello: z.string() }) }).handle(() => ({ hello: 'world' }));

  static items = procedure({ iteration: z.object({ item: z.boolean() }) }).handle(function* () {
    yield { item: true };
  });
}

export function fnResultTypes() {
  // a variable first: satisfies would give the call a contextual type to infer its result from
  const echo = FnResultController.echo.fn({ query: { q: 'x' } });
  echo satisfies Promise<{ q: string }>;
  const greeting = FnResultController.greeting.fn();
  greeting satisfies Promise<{ hello: string }>;
  const items = FnResultController.items.fn();
  items satisfies Promise<AsyncIterable<{ item: boolean }>>;
}

// Test 14: the result type comes from the handler, not from the type the caller expects
export async function fnResultNotFromContext() {
  // @ts-expect-error fn() resolves to { q: string }
  const wrongPromise: Promise<string> = FnResultController.echo.fn({ query: { q: 'x' } });
  // @ts-expect-error fn() resolves to { q: string }
  const wrongValue: number = await FnResultController.echo.fn({ query: { q: 'x' } });
  // @ts-expect-error fn() resolves to { q: string }
  (await FnResultController.echo.fn({ query: { q: 'x' } })) satisfies { other: boolean };
  // a type argument still sets it
  const explicit = await FnResultController.echo.fn<{ q: string }>({ query: { q: 'x' } });
  explicit.q satisfies string;
  return [wrongPromise, wrongValue];
}

// ====== preferTransformed: false sends what the handler returns ======

// Test 15: the output and the iteration items are the schema's input, not what its transform makes
class UntransformedResultController {
  static count = procedure({
    output: z.object({ n: z.number().transform(String) }),
    preferTransformed: false,
  }).handle(async () => ({ n: 1 }));

  static items = procedure({
    iteration: z.object({ n: z.number().transform(String) }),
    preferTransformed: false,
  }).handle(async function* () {
    yield { n: 1 };
  });
}

export async function untransformedResults() {
  (await UntransformedResultController.count.fn()).n satisfies number;
  for await (const item of await UntransformedResultController.items.fn()) item.n satisfies number;

  const rpc = createRPC<typeof UntransformedResultController>({}, '', 'UntransformedResultRPC');
  (await rpc.count()).n satisfies number;
  for await (const item of await rpc.items()) item.n satisfies number;
}

// ====== output and iteration are mutually exclusive ======

// Test 16: procedure() throws when both are set, so the types refuse them together
function outputAndIteration() {
  // @ts-expect-error output and iteration together
  procedure({ output: z.object({ a: z.string() }), iteration: z.object({ b: z.string() }) });
  procedure({ output: z.object({ a: z.string() }) }).handle(async () => ({ a: 'x' }));
  procedure({ iteration: z.object({ b: z.string() }) }).handle(async function* () {
    yield { b: 'x' };
  });
}

export {
  FnResultController,
  noOptions,
  noParamsSchema,
  outputAndIteration,
  PlainSearchParams,
  rawRequestTypes,
  returnsSchemaInput,
  returnsSchemaOutput,
  searchParamsTypes,
  searchParamsWithoutSchema,
  selfRef,
  TestController,
  test1,
  test2,
  test3,
  test4,
  test5,
  UntransformedResultController,
  untransformedTypes,
  withParamsSchema,
};
