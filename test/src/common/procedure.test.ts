import assert from 'node:assert';
import { describe, it } from 'node:test';
import { toStandardJsonSchema } from '@valibot/to-json-schema';
import { type } from 'arktype';
import * as v from 'valibot';
import type { VovkRequest } from 'vovk';
import { procedure } from 'vovk';
import { z } from 'zod';

describe('procedure features', async () => {
  const definition = {
    body: z.object({ foo: z.string().max(5) }),
    query: z.object({ bar: z.string().max(5) }),
    params: z.object({ baz: z.string().max(5) }),
  } as const;
  const handleFn = async ({ vovk }: VovkRequest<{ foo: string }, { bar: string }, { baz: string }>) => {
    const { foo } = await vovk.body();
    const { bar } = vovk.query();
    const { baz } = vovk.params();
    const { inputMeta } = vovk.meta<{ inputMeta?: string }>();
    return { foo, bar, baz, inputMeta };
  };
  const handler = procedure(definition).handle(handleFn);

  it('Should provide definition', () => {
    assert.strictEqual(handler.definition.body, definition.body);
    assert.strictEqual(handler.definition.query, definition.query);
    assert.strictEqual(handler.definition.params, definition.params);
    assert.strictEqual(handler.definition.handle, handleFn);
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

  it('Should transform only type of response via generic', async () => {
    const result = await handler.fn<{ foo: string; bar: string; baz: string; hello1: string; inputMeta?: string }>({
      body: { foo: 'foo1' },
      query: { bar: 'bar2' },
      params: { baz: 'baz3' },
      meta: { hello: 'world', inputMeta: 'metaValue' },
    });

    result satisfies { foo: string; bar: string; baz: string; hello1: string; inputMeta?: string };
  });

  it('Should be able to use no arguments', async () => {
    const noArgsHandler = procedure().handle(async () => {
      return { message: 'no args' };
    });

    const result = await noArgsHandler.fn();
    assert.deepEqual(result, { message: 'no args' });
  });

  it('Should be able to use no arguments and transform type via generic', async () => {
    const noArgsHandler = procedure().handle(async () => {
      return { message: 'no args' };
    });

    const result = await noArgsHandler.fn<{ message: string }>();
    result satisfies { message: string };
  });

  it('Should convert FormData to an object when passed as a body', async () => {
    const formData = new FormData();
    formData.append('foo', 'bar');

    const handler = procedure({
      contentType: ['multipart/form-data'],
      body: z.object({
        foo: z.literal('bar'),
      }),
    }).handle(({ vovk }) => {
      return vovk.body();
    });

    assert.deepEqual(await handler.fn({ body: formData }), { foo: 'bar' });
  });

  it('Should keep FormData keys as own values', async () => {
    const formData = new FormData();
    formData.append('__proto__', 'x');
    formData.append('toString', 't');
    formData.append('tags', '');
    formData.append('tags', 'b');

    const handler = procedure({ contentType: ['multipart/form-data'] }).handle(({ vovk }) => vovk.body());
    const body = (await handler.fn({ body: formData })) as Record<string, unknown>;

    assert.equal(Object.getPrototypeOf(body), Object.prototype);
    assert.deepEqual({ ...body }, { toString: 't', tags: ['', 'b'] });
  });

  it('Should assign schema', async () => {
    assert.equal(handler.schema.validation?.body?.$schema, 'https://json-schema.org/draft/2020-12/schema');
    assert.equal(handler.schema.validation?.query?.$schema, 'https://json-schema.org/draft/2020-12/schema');
    assert.equal(handler.schema.validation?.params?.$schema, 'https://json-schema.org/draft/2020-12/schema');
  });

  it('Should emit a type JSON Schema cannot describe as any value', async () => {
    const zodHandler = procedure({ query: z.object({ from: z.coerce.date(), id: z.bigint(), ok: z.string() }) }).handle(
      () => null
    );
    const valibotHandler = procedure({ query: toStandardJsonSchema(v.object({ from: v.date() })) }).handle(() => null);
    const arktypeHandler = procedure({ query: type({ from: 'Date' }) }).handle(() => null);

    assert.deepEqual(zodHandler.schema.validation?.query?.properties, { from: {}, id: {}, ok: { type: 'string' } });
    assert.deepEqual(valibotHandler.schema.validation?.query?.properties, { from: {} });
    assert.deepEqual(arktypeHandler.schema.validation?.query?.properties, { from: {} });
  });
});
