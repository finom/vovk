import { procedure, type VovkParams, type VovkBody, type VovkOutput } from 'vovk';
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

export { test1, test2, test3, test4, test5, TestController, selfRef };
