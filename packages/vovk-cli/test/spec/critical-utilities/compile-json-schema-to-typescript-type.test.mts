import assert from 'node:assert';
import { describe, it } from 'node:test';
import type { JSONSchema7 } from 'json-schema';
import { ts } from 'ts-morph';
import { compileJSONSchemaToTypeScriptType } from '../../../dist/utils/compile-json-schema-to-typescript-type.mjs';

const components = {
  schemas: {
    Base: { type: 'object', properties: { id: { type: 'string' } } },
    '2FAConfig': { type: 'object', properties: { secret: { type: 'string' } } },
  },
} as const;

function compile(schema: JSONSchema7, typeName: string) {
  const code = compileJSONSchemaToTypeScriptType(schema, typeName, components as never, { dontCreateRefTypes: true });
  const { diagnostics = [] } = ts.transpileModule(code, { reportDiagnostics: true });
  assert.deepStrictEqual(
    diagnostics.map(({ messageText }) => ts.flattenDiagnosticMessageText(messageText, '\n')),
    [],
    `invalid TypeScript:\n${code}`
  );
  return code;
}

await describe('compileJSONSchemaToTypeScriptType', async () => {
  await it('Escapes a quoted property name', () => {
    const code = compile(
      { type: 'object', properties: { 'a"b': { type: 'string' }, 'x-y\\z': { type: 'number' } } },
      'T'
    );
    assert.strictEqual(code, 'export type T = { "a\\"b"?: string; "x-y\\\\z"?: number };');
  });

  await it('Keeps the properties next to allOf', () => {
    const code = compile(
      { allOf: [{ $ref: '#/components/schemas/Base' }], properties: { name: { type: 'string' } } },
      'T'
    );
    assert.strictEqual(code, 'export type T = Base & { name?: string };');
  });

  await it('Keeps the properties next to oneOf', () => {
    const code = compile(
      {
        oneOf: [{ $ref: '#/components/schemas/Base' }, { type: 'object', properties: { x: { type: 'number' } } }],
        properties: { kind: { type: 'string' } },
        required: ['kind'],
      },
      'T'
    );
    assert.strictEqual(code, 'export type T = (Base | { x?: number }) & { kind: string };');
  });

  await it('Intersects allOf members that declare the same property', () => {
    const code = compile(
      {
        allOf: [
          { type: 'object', properties: { a: { type: 'string' } } },
          { type: 'object', required: ['a'], properties: { a: { type: 'string' } } },
        ],
      },
      'T'
    );
    assert.strictEqual(code, 'export type T = { a?: string } & { a: string };');
  });

  await it('Applies the other allOf members to every branch of a union member', () => {
    const code = compile(
      {
        allOf: [
          {
            oneOf: [
              { type: 'object', properties: { x: { type: 'string' } } },
              { type: 'object', properties: { y: { type: 'string' } } },
            ],
          },
          { type: 'object', properties: { z: { type: 'number' } } },
        ],
      },
      'T'
    );
    assert.strictEqual(code, 'export type T = ({ x?: string } | { y?: string }) & { z?: number };');
  });

  await it('Ignores an allOf member without a type', () => {
    const code = compile({ allOf: [{ description: 'A base' }, { $ref: '#/components/schemas/Base' }] }, 'T');
    assert.strictEqual(code, 'export type T = Base;');
  });

  await it('Wraps the intersection of allOf members in an array item type', () => {
    const inline = compile(
      {
        type: 'array',
        items: {
          allOf: [
            { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
            { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] },
          ],
        },
      },
      'T'
    );
    assert.strictEqual(inline, 'export type T = ({ id: string } & { name: string })[];');

    const refs = compile(
      {
        type: 'array',
        items: { allOf: [{ $ref: '#/components/schemas/Base' }, { $ref: '#/components/schemas/2FAConfig' }] },
      },
      'T'
    );
    assert.strictEqual(refs, 'export type T = (Base & _2FaConfig)[];');
  });

  // an OpenAPI 3.1 component or response may be a boolean schema
  await it('Compiles a boolean schema', () => {
    assert.strictEqual(compile(true as unknown as JSONSchema7, 'T'), 'export type T = any;');
    assert.strictEqual(compile(false as unknown as JSONSchema7, 'T'), 'export type T = never;');
  });

  await it('Reads OpenAPI 3.0 nullable', () => {
    const code = compile(
      {
        type: 'object',
        properties: {
          name: { type: 'string', nullable: true },
          base: { $ref: '#/components/schemas/Base', nullable: true },
          tags: { type: 'array', items: { type: 'string', nullable: true } },
          plain: { type: 'string', nullable: false },
        },
      } as JSONSchema7,
      'T'
    );
    assert.strictEqual(
      code,
      'export type T = { name?: string | null; base?: Base | null; tags?: (string | null)[]; plain?: string };'
    );
  });

  await it('Gives a name that starts with a digit a leading underscore, in declarations and refs', () => {
    assert.strictEqual(compile({ type: 'string' }, '2FAConfig'), 'export type _2FaConfig = string;');
    assert.strictEqual(
      compile({ type: 'object', properties: { config: { $ref: '#/components/schemas/2FAConfig' } } }, 'T'),
      'export type T = { config?: _2FaConfig };'
    );
  });
});
