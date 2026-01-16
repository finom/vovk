import { it, describe } from 'node:test';
import { procedure } from 'vovk';
import { z } from 'zod';
import assert from 'node:assert';

describe('procedure features', async () => {
  const definition: Parameters<typeof procedure>[0] = {
    body: z.object({ foo: z.string().max(5) }),
    query: z.object({ bar: z.string().max(5) }),
    params: z.object({ baz: z.string().max(5) }),
    async handle({ vovk }) {
      const { foo } = await vovk.body();
      const { bar } = vovk.query();
      const { baz } = vovk.params();
      const { inputMeta } = vovk.meta<{ inputMeta?: string }>();
      return { foo, bar, baz, inputMeta };
    },
  } as const;
  const handler = procedure(definition);

  it('Should provide definition', () => {
    assert.strictEqual(handler.definition.body, definition.body);
    assert.strictEqual(handler.definition.query, definition.query);
    assert.strictEqual(handler.definition.params, definition.params);
    assert.strictEqual(handler.definition.handle, definition.handle);
  });

  it('Should be callable', async () => {
    const result = await handler.fn({
      body: { foo: 'foo1' },
      query: { bar: 'bar2' },
      params: { baz: 'baz3' },
      meta: { inputMeta: 'metaValue' },
    });

    result satisfies { foo: string; bar: string; baz: string; inputMeta?: string };
    assert.deepEqual(result, { foo: 'foo1', bar: 'bar2', baz: 'baz3', inputMeta: 'metaValue' });
  });

  it('Should validate', async () => {
    await assert.rejects(
      handler.fn({
        body: { foo: 'foo1long' },
        query: { bar: 'bar2' },
        params: { baz: 'baz3' },
      }),
      {
        message: 'Validation failed. Invalid body: Too big: expected string to have <=5 characters at foo',
      }
    );
    await assert.rejects(
      handler.fn({
        body: { foo: 'foo1' },
        query: { bar: 'bar2long' },
        params: { baz: 'baz3' },
      }),
      {
        message: 'Validation failed. Invalid query: Too big: expected string to have <=5 characters at bar',
      }
    );
    await assert.rejects(
      handler.fn({
        body: { foo: 'foo1' },
        query: { bar: 'bar2' },
        params: { baz: 'baz3long' },
      }),
      {
        message: 'Validation failed. Invalid params: Too big: expected string to have <=5 characters at baz',
      }
    );
  });

  it('Should disable client validation', async () => {
    assert.deepEqual(
      await handler.fn({
        body: { foo: 'foo1long' },
        query: { bar: 'bar2long' },
        params: { baz: 'baz3long' },
        meta: { inputMeta: 'metaValue' },
        disableClientValidation: true,
      }),
      {
        foo: 'foo1long',
        bar: 'bar2long',
        baz: 'baz3long',
        inputMeta: 'metaValue',
      }
    );
  });

  it('Should transform response', async () => {
    const result = await handler.fn({
      body: { foo: 'foo1' },
      query: { bar: 'bar2' },
      params: { baz: 'baz3' },
      meta: { hello: 'world', inputMeta: 'metaValue' },
      transform: (data, req) => {
        const hello1 = req.vovk.meta<{ hello: string }>().hello;
        return { ...data, hello1 } as const;
      },
    });

    result satisfies { foo: string; bar: string; baz: string; hello1: string; inputMeta?: string };
    assert.deepEqual(result, { foo: 'foo1', bar: 'bar2', baz: 'baz3', hello1: 'world', inputMeta: 'metaValue' });
  });

  it('Should assign schema', async () => {
    assert.equal(handler.schema.validation?.body?.$schema, 'https://json-schema.org/draft/2020-12/schema');
    assert.equal(handler.schema.validation?.query?.$schema, 'https://json-schema.org/draft/2020-12/schema');
    assert.equal(handler.schema.validation?.params?.$schema, 'https://json-schema.org/draft/2020-12/schema');
  });
});
