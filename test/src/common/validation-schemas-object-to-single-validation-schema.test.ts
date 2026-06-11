import { it, describe } from 'node:test';
import assert from 'node:assert';
import { z } from 'zod';
import { validationSchemasObjectToSingleValidationSchema } from 'vovk/internal';

type StandardResult = { value?: unknown; issues?: ReadonlyArray<{ message: string; path?: unknown[] }> };

function makeMockSchema(opts: {
  validate?: (input: unknown) => StandardResult | Promise<StandardResult>;
  input?: (target: string) => Record<string, unknown>;
  output?: (target: string) => Record<string, unknown>;
}) {
  return {
    '~standard': {
      version: 1 as const,
      vendor: 'mock',
      validate: opts.validate ?? ((input: unknown) => ({ value: input })),
      jsonSchema: {
        input: ({ target }: { target: string }) =>
          opts.input ? opts.input(target) : { type: 'object', marker: 'input', target },
        output: ({ target }: { target: string }) =>
          opts.output ? opts.output(target) : { type: 'object', marker: 'output', target },
      },
    },
    // biome-ignore lint/suspicious/noExplicitAny: test fixture conforming to CombinedSpec
  } as any;
}

describe('validationSchemasObjectToSingleValidationSchema', () => {
  describe('Standard Schema spec compliance', () => {
    it('exposes version=1 and vendor=vovk on ~standard', () => {
      const merged = validationSchemasObjectToSingleValidationSchema({});
      assert.strictEqual(merged['~standard'].version, 1);
      assert.strictEqual(merged['~standard'].vendor, 'vovk');
      assert.strictEqual(typeof merged['~standard'].validate, 'function');
      assert.strictEqual(typeof merged['~standard'].jsonSchema.input, 'function');
      assert.strictEqual(typeof merged['~standard'].jsonSchema.output, 'function');
    });

    it('exposes pass-through slot references on the result object', () => {
      const bodySchema = z.object({ foo: z.string() });
      const querySchema = z.object({ bar: z.number() });
      const merged = validationSchemasObjectToSingleValidationSchema({
        body: bodySchema,
        query: querySchema,
      });
      assert.strictEqual(merged.body, bodySchema);
      assert.strictEqual(merged.query, querySchema);
      assert.strictEqual('params' in merged, false);
    });
  });

  describe('validate — top-level shape', () => {
    const merged = validationSchemasObjectToSingleValidationSchema({
      body: z.object({ foo: z.string() }),
    });

    it('rejects null with empty path', () => {
      const result = merged['~standard'].validate(null) as StandardResult;
      assert.ok(result.issues);
      assert.deepStrictEqual(result.issues[0], { message: 'Expected object', path: [] });
    });

    it('rejects array', () => {
      const result = merged['~standard'].validate([]) as StandardResult;
      assert.ok(result.issues);
      assert.deepStrictEqual(result.issues[0], { message: 'Expected object', path: [] });
    });

    it('rejects primitive (string)', () => {
      const result = merged['~standard'].validate('hello') as StandardResult;
      assert.ok(result.issues);
      assert.deepStrictEqual(result.issues[0], { message: 'Expected object', path: [] });
    });

    it('rejects primitive (number)', () => {
      const result = merged['~standard'].validate(42) as StandardResult;
      assert.ok(result.issues);
      assert.deepStrictEqual(result.issues[0], { message: 'Expected object', path: [] });
    });

    it('accepts empty object when no slots defined', () => {
      const empty = validationSchemasObjectToSingleValidationSchema({});
      const result = empty['~standard'].validate({}) as StandardResult;
      assert.strictEqual(result.issues, undefined);
      assert.deepStrictEqual(result.value, {});
    });
  });

  describe('validate — key presence and strict rejection', () => {
    it('reports missing defined slot with prefixed path', () => {
      const merged = validationSchemasObjectToSingleValidationSchema({
        body: z.object({ foo: z.string() }),
      });
      const result = merged['~standard'].validate({}) as StandardResult;
      assert.ok(result.issues);
      const missing = result.issues.find((i) => i.message === 'Required');
      assert.deepStrictEqual(missing?.path, [{ key: 'body' }]);
    });

    it('reports unexpected key with prefixed path', () => {
      const merged = validationSchemasObjectToSingleValidationSchema({
        body: z.object({ foo: z.string() }),
      });
      const result = merged['~standard'].validate({
        body: { foo: 'x' },
        extra: 'oops',
      }) as StandardResult;
      assert.ok(result.issues);
      const unexpected = result.issues.find((i) => i.message === 'Unexpected key');
      assert.deepStrictEqual(unexpected?.path, [{ key: 'extra' }]);
    });

    it('aggregates multiple top-level problems (does not short-circuit)', () => {
      const merged = validationSchemasObjectToSingleValidationSchema({
        body: z.object({ foo: z.string() }),
        query: z.object({ bar: z.number() }),
      });
      const result = merged['~standard'].validate({ extra1: 1, extra2: 2 }) as StandardResult;
      assert.ok(result.issues);
      const messages = result.issues.map((i) => {
        const key = ((i.path?.[0] as { key?: string } | undefined)?.key as string) ?? '';
        return `${i.message}:${key}`;
      });
      assert.ok(messages.includes('Required:body'));
      assert.ok(messages.includes('Required:query'));
      assert.ok(messages.includes('Unexpected key:extra1'));
      assert.ok(messages.includes('Unexpected key:extra2'));
    });
  });

  describe('validate — delegation to slot schemas', () => {
    it('returns success with parsed values when all slots valid', () => {
      const merged = validationSchemasObjectToSingleValidationSchema({
        body: z.object({ foo: z.string() }),
        query: z.object({ bar: z.number() }),
        params: z.object({ baz: z.string() }),
      });
      const result = merged['~standard'].validate({
        body: { foo: 'a' },
        query: { bar: 1 },
        params: { baz: 'b' },
      }) as StandardResult;
      assert.strictEqual(result.issues, undefined);
      assert.deepStrictEqual(result.value, {
        body: { foo: 'a' },
        query: { bar: 1 },
        params: { baz: 'b' },
      });
    });

    it('prefixes slot validation issues with the slot key segment', () => {
      const merged = validationSchemasObjectToSingleValidationSchema({
        body: z.object({ foo: z.string() }),
      });
      const result = merged['~standard'].validate({ body: { foo: 42 } }) as StandardResult;
      assert.ok(result.issues);
      assert.ok(result.issues.length > 0);
      const first = result.issues[0]!;
      assert.deepStrictEqual(first.path?.[0], { key: 'body' });
      assert.ok((first.path?.length ?? 0) >= 2, 'expected slot path to be prefixed onto slot’s own path');
    });

    it('keeps sync when all slot validators are sync', () => {
      const merged = validationSchemasObjectToSingleValidationSchema({
        body: z.object({ foo: z.string() }),
      });
      const result = merged['~standard'].validate({ body: { foo: 'x' } });
      assert.strictEqual(
        typeof (result as { then?: unknown }).then,
        'undefined',
        'sync slots should produce a sync Result'
      );
    });

    it('returns a Promise when any slot validator is async', async () => {
      const asyncSlot = makeMockSchema({
        validate: async (input) => ({ value: input }),
      });
      const merged = validationSchemasObjectToSingleValidationSchema({
        body: asyncSlot,
      });
      const result = merged['~standard'].validate({ body: { foo: 'x' } });
      assert.strictEqual(typeof (result as { then?: unknown }).then, 'function');
      const awaited = (await result) as StandardResult;
      assert.deepStrictEqual(awaited.value, { body: { foo: 'x' } });
    });

    it('returns a Promise on mixed sync + async slots', async () => {
      const merged = validationSchemasObjectToSingleValidationSchema({
        body: z.object({ foo: z.string() }),
        query: makeMockSchema({ validate: async (input) => ({ value: input }) }),
      });
      const result = merged['~standard'].validate({
        body: { foo: 'x' },
        query: { bar: 1 },
      });
      assert.strictEqual(typeof (result as { then?: unknown }).then, 'function');
      const awaited = (await result) as StandardResult;
      assert.strictEqual(awaited.issues, undefined);
    });
  });

  describe('validate — partial schemas', () => {
    it('only validates defined slots; rejects undefined slot keys as unexpected', () => {
      const merged = validationSchemasObjectToSingleValidationSchema({
        body: z.object({ foo: z.string() }),
      });
      const result = merged['~standard'].validate({
        body: { foo: 'x' },
        query: { bar: 1 },
      }) as StandardResult;
      assert.ok(result.issues);
      const unexpected = result.issues.find((i) => i.message === 'Unexpected key');
      assert.deepStrictEqual(unexpected?.path, [{ key: 'query' }]);
    });
  });

  describe('jsonSchema.input', () => {
    it('returns top-level envelope with delegated slot properties', () => {
      const bodySlot = makeMockSchema({ input: () => ({ type: 'object', tag: 'body' }) });
      const querySlot = makeMockSchema({ input: () => ({ type: 'object', tag: 'query' }) });
      const merged = validationSchemasObjectToSingleValidationSchema({
        body: bodySlot,
        query: querySlot,
      });
      const schema = merged['~standard'].jsonSchema.input({ target: 'draft-2020-12' });
      assert.strictEqual(schema.type, 'object');
      assert.strictEqual(schema.additionalProperties, false);
      assert.deepStrictEqual(schema.required, ['body', 'query']);
      const properties = schema.properties as Record<string, Record<string, unknown>>;
      assert.deepStrictEqual(properties.body, { type: 'object', tag: 'body' });
      assert.deepStrictEqual(properties.query, { type: 'object', tag: 'query' });
    });

    it('required lists only defined slots', () => {
      const merged = validationSchemasObjectToSingleValidationSchema({
        body: makeMockSchema({}),
      });
      const schema = merged['~standard'].jsonSchema.input({ target: 'draft-2020-12' });
      assert.deepStrictEqual(schema.required, ['body']);
    });

    it('falls back to {} for slots whose ~standard does not expose jsonSchema', () => {
      const slotWithoutJsonSchema = {
        '~standard': {
          version: 1 as const,
          vendor: 'mock',
          validate: (input: unknown) => ({ value: input }),
          // intentionally no jsonSchema — matches libraries that only implement Standard Schema, not Standard JSON Schema
        },
        // biome-ignore lint/suspicious/noExplicitAny: minimal test fixture
      } as any;
      const merged = validationSchemasObjectToSingleValidationSchema({ body: slotWithoutJsonSchema });
      const schema = merged['~standard'].jsonSchema.input({ target: 'draft-2020-12' });
      const properties = schema.properties as Record<string, Record<string, unknown>>;
      assert.deepStrictEqual(properties.body, {});
    });

    it('propagates the target option to slot delegations', () => {
      const slot = makeMockSchema({
        input: (target) => ({ marker: 'input', target }),
      });
      const merged = validationSchemasObjectToSingleValidationSchema({ body: slot });
      const schema = merged['~standard'].jsonSchema.input({ target: 'draft-07' });
      const properties = schema.properties as Record<string, Record<string, unknown>>;
      assert.deepStrictEqual(properties.body, { marker: 'input', target: 'draft-07' });
    });
  });

  describe('jsonSchema.output', () => {
    it('delegates to each slot’s output method (distinct from input)', () => {
      const slot = makeMockSchema({
        input: () => ({ shape: 'IN' }),
        output: () => ({ shape: 'OUT' }),
      });
      const merged = validationSchemasObjectToSingleValidationSchema({ body: slot });
      const inputJSON = merged['~standard'].jsonSchema.input({ target: 'draft-2020-12' });
      const outputJSON = merged['~standard'].jsonSchema.output({ target: 'draft-2020-12' });
      const inputProps = inputJSON.properties as Record<string, Record<string, unknown>>;
      const outputProps = outputJSON.properties as Record<string, Record<string, unknown>>;
      assert.deepStrictEqual(inputProps.body, { shape: 'IN' });
      assert.deepStrictEqual(outputProps.body, { shape: 'OUT' });
    });
  });

  describe('jsonSchema — no slots', () => {
    it('returns the empty-properties envelope', () => {
      const merged = validationSchemasObjectToSingleValidationSchema({});
      const schema = merged['~standard'].jsonSchema.input({ target: 'draft-2020-12' });
      assert.deepStrictEqual(schema, {
        type: 'object',
        properties: {},
        required: [],
        additionalProperties: false,
      });
    });
  });
});
