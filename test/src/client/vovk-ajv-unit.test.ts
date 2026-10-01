import { rejects, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import type { VovkJSONSchemaBase } from 'vovk';
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
});
