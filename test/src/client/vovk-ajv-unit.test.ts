import { deepStrictEqual, rejects, strictEqual } from 'node:assert';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';
import { procedure, type VovkJSONSchemaBase } from 'vovk';
import { z } from 'zod';
import { validateOnClient } from '../../../packages/vovk-ajv/index.js';

const fullSchema = { $schema: '', segments: {} };
const $schema = 'https://json-schema.org/draft/2020-12/schema' as const;

const validateBody = (body: unknown, schema: object) =>
  validateOnClient({ body }, { body: schema as VovkJSONSchemaBase }, { fullSchema, endpoint: '/x' });

describe('vovk-ajv', () => {
  it('Validates a schema with keywords JSON Schema does not define', async () => {
    const schema = {
      $schema,
      type: 'object',
      properties: {
        // Zod's .meta({ example })
        name: { type: 'string', maxLength: 5, example: 'Alice', description: 'User name' },
        // OpenAPI keywords a mixin carries
        pet: {
          oneOf: [{ type: 'object', properties: { kind: { const: 'cat' } } }],
          discriminator: { propertyName: 'kind' },
          xml: { name: 'pet' },
          externalDocs: { url: 'https://example.com' },
          'x-go-name': 'Pet',
        },
      },
      required: ['name'],
    };

    await validateBody({ name: 'Bob', pet: { kind: 'cat' } }, schema);
    await rejects(validateBody({ name: 'Robert' }, schema), /data\/name must NOT have more than 5 characters/);
  });

  it('Skips client-side validation for a schema Ajv cannot compile', async (t) => {
    const warn = t.mock.method(console, 'warn', () => {});
    const schema = { $schema, type: 'object', properties: { a: { $ref: '#/$defs/Missing' } } };

    await validateBody({ a: 1 }, schema);
    await validateBody({ a: 2 }, schema);

    strictEqual(warn.mock.callCount(), 1);
  });

  it('Reads a pattern the way JavaScript does', async () => {
    // escapes Zod's regexes keep, which the u flag refuses
    const cases = [
      ['^\\d{3}\\-\\d{4}$', '555-1234', '5551234'],
      ['^[\\w-.]+$', 'a.b-c', 'a b'],
      ['^[a-z\\_]+$', 'a_b', 'A'],
      ['^\\#[0-9a-f]{6}$', '#ff00aa', 'ff00aa'],
    ];
    for (const [pattern, valid, invalid] of cases) {
      const schema = { $schema, type: 'object', properties: { v: { type: 'string', pattern } }, required: ['v'] };
      await validateBody({ v: valid }, schema);
      await rejects(validateBody({ v: invalid }, schema), /data\/v must match pattern/);
    }
  });

  it('Reads a Unicode property escape, next to the escapes the u flag refuses', async () => {
    // z.emoji() and z.string().regex(/^\p{L}+$/u) emit \p{…}, which JavaScript reads only with the u flag
    const cases = {
      emoji: ['^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$', '😀', 'a'],
      letters: ['^\\p{L}+$', 'Zoë', 'Zo1'],
      // the escapes of the test above, in the same schema
      phone: ['^\\d{3}\\-\\d{4}$', '555-1234', '5551234'],
      slug: ['^[\\w-.]+$', 'a.b-c', 'a b'],
    };
    const entries = Object.entries(cases);
    const schema = {
      $schema,
      type: 'object',
      properties: Object.fromEntries(entries.map(([key, [pattern]]) => [key, { type: 'string', pattern }])),
    };

    await validateBody(Object.fromEntries(entries.map(([key, [, valid]]) => [key, valid])), schema);
    for (const [key, [, , invalid]] of entries) {
      await rejects(validateBody({ [key]: invalid }, schema), new RegExp(`data/${key} must match pattern`));
    }
  });

  it('Reads the boolean exclusive bounds of OpenAPI 3.0', async () => {
    const schema = {
      type: 'object',
      properties: {
        age: { type: 'integer', minimum: 0, exclusiveMinimum: true },
        price: { type: 'number', maximum: 10, exclusiveMaximum: false },
        name: { type: 'string', nullable: true },
      },
    };

    await validateBody({ age: 1, price: 10, name: null }, schema);
    await rejects(validateBody({ age: 0 }, schema), /data\/age must be > 0/);
    await rejects(validateBody({ price: 11 }, schema), /data\/price must be <= 10/);
    // the schema the client holds stays as it is
    strictEqual(schema.properties.age.exclusiveMinimum, true);
  });

  it('Validates a FormData body with the types its strings stand for', async () => {
    const schema = {
      $schema,
      type: 'object',
      properties: { age: { type: 'number' }, tags: { type: 'array', items: { type: 'string' } } },
      required: ['age'],
      'x-contentType': ['multipart/form-data'],
    };
    const form = new FormData();
    form.append('age', '5');
    form.append('tags', 'a');
    form.append('tags', 'b');
    const invalid = new FormData();
    invalid.append('age', 'five');

    await validateBody(form, schema);
    deepStrictEqual(form.getAll('age'), ['5']);
    await rejects(validateBody(invalid, schema), /data\/age must be number/);
    await rejects(validateBody({ age: '5' }, schema), /data\/age must be number/);
  });

  it('Validates params and query as the strings a URL carries', async () => {
    // the input schema of z.coerce.number() is a number, the server coerces the string it gets
    const getItems = procedure({
      params: z.object({ id: z.coerce.number() }),
      query: z.object({ page: z.coerce.number().default(1) }),
    }).handle(async () => null);
    const validate = (input: { params?: object; query?: object }) =>
      validateOnClient(input, getItems.schema.validation ?? {}, { fullSchema, endpoint: '/x' });

    await validate({ params: { id: '1' } });
    await validate({ query: { page: '2' } });
    await rejects(validate({ params: { id: 'one' } }), /Invalid params: data\/id must be number/);
    await rejects(validate({ query: { page: 'two' } }), /Invalid query: data\/page must be number/);
  });

  it('Validates a falsy body, and leaves a missing one alone', async () => {
    const cases: [unknown, object][] = [
      ['', { type: 'string', minLength: 1 }],
      [0, { type: 'number', minimum: 1 }],
      [false, { const: true }],
      [null, { type: 'object' }],
    ];

    for (const [body, schema] of cases) {
      await rejects(validateBody(body, { $schema, ...schema }), /Client-side validation failed\. Invalid body: data /);
    }
    await validateBody(undefined, { $schema, type: 'object' });
  });

  it('Compiles a schema once for every object with the same text', async () => {
    // the copy of Ajv that vovk-ajv itself loads
    const requireFromAjvPackage = createRequire(new URL('../../../packages/vovk-ajv/index.js', import.meta.url));
    const AjvCore = requireFromAjvPackage('ajv/dist/core.js').default;
    const compile = AjvCore.prototype.compile;
    let compiles = 0;
    AjvCore.prototype.compile = function (this: unknown, ...args: unknown[]) {
      compiles++;
      return compile.apply(this, args);
    };
    // Ajv keeps every function it compiles, so a new object for each call must not compile again
    const schema = { $schema, type: 'object', properties: { name: { type: 'string', minLength: 2 } } };

    try {
      for (let i = 0; i < 5; i++) await validateBody({ name: 'ab' }, structuredClone(schema));
      await rejects(validateBody({ name: 'a' }, structuredClone(schema)), /data\/name must NOT have fewer than 2/);
    } finally {
      AjvCore.prototype.compile = compile;
    }

    strictEqual(compiles, 1);
  });
});
