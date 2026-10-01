import { procedure, type VovkBody, type VovkOutput, type VovkParams } from 'vovk';
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
  for (const [key, value] of searchParams.entries()) {
    key satisfies string;
    value satisfies string;
  }
  return null;
});

export {
  noOptions,
  noParamsSchema,
  searchParamsTypes,
  selfRef,
  TestController,
  test1,
  test2,
  test3,
  test4,
  test5,
  withParamsSchema,
};
