import { it, describe } from 'node:test';
import { withZod } from 'vovk-zod';
import { z } from 'zod';
import assert from 'node:assert';

describe('Controller handler with validation', async () => {
  const handler = withZod({
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
  });

  it('Should be callable', async () => {
    assert.deepEqual(
      await handler.fn({
        body: { foo: 'foo1' },
        query: { bar: 'bar2' },
        params: { baz: 'baz3' },
        meta: { inputMeta: 'metaValue' },
      }),
      { foo: 'foo1', bar: 'bar2', baz: 'baz3', inputMeta: 'metaValue' }
    );
  });

  it('Should validate', async () => {
    await assert.rejects(
      handler.fn({
        body: { foo: 'foo1long' },
        query: { bar: 'bar2' },
        params: { baz: 'baz3' },
      }),
      {
        message: 'Validation failed. Invalid body on server: Too big: expected string to have <=5 characters at foo',
      }
    );
    await assert.rejects(
      handler.fn({
        body: { foo: 'foo1' },
        query: { bar: 'bar2long' },
        params: { baz: 'baz3' },
      }),
      {
        message: 'Validation failed. Invalid query on server: Too big: expected string to have <=5 characters at bar',
      }
    );
    await assert.rejects(
      handler.fn({
        body: { foo: 'foo1' },
        query: { bar: 'bar2' },
        params: { baz: 'baz3long' },
      }),
      {
        message: 'Validation failed. Invalid params on server: Too big: expected string to have <=5 characters at baz',
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

  it('Should assign schema', async () => {
    assert.equal(handler.schema.validation?.body?.$schema, 'https://json-schema.org/draft/2020-12/schema');
    assert.equal(handler.schema.validation?.query?.$schema, 'https://json-schema.org/draft/2020-12/schema');
    assert.equal(handler.schema.validation?.params?.$schema, 'https://json-schema.org/draft/2020-12/schema');
  });
});
