import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { VovkJSONSchemaBase } from '../../vovk/src/index.js';
import { convertJSONSchemasToRustTypes, getBodyKind } from '../index.js';

describe('convertJSONSchemasToRustTypes', () => {
  test('basic primitive types', () => {
    const schemas: Record<string, VovkJSONSchemaBase> = {
      BasicTypes: {
        type: 'object',
        properties: {
          stringProp: { type: 'string' },
          numberProp: { type: 'number' },
          integerProp: { type: 'integer' },
          booleanProp: { type: 'boolean' },
        },
        required: ['stringProp', 'booleanProp'],
      },
    };

    const output = convertJSONSchemasToRustTypes({
      schemas,
      rootName: 'test',
    });

    assert.ok(output.includes('pub struct BasicTypes'));
    assert.ok(output.includes('pub stringProp: String,'));
    assert.ok(output.includes('pub numberProp: Option<f64>,'), output);
    assert.ok(output.includes('pub integerProp: Option<i64>,'));
    assert.ok(output.includes('pub booleanProp: bool,'));
  });

  test('nested objects', () => {
    const schemas: Record<string, VovkJSONSchemaBase> = {
      Parent: {
        type: 'object',
        properties: {
          child: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'integer' },
            },
          },
        },
      },
    } as const;

    const output = convertJSONSchemasToRustTypes({
      schemas,
      rootName: 'test',
    });

    assert.ok(output.includes('pub struct Parent'));
    assert.ok(output.includes('pub child: Option<Parent_::child>,'));
    assert.ok(output.includes('pub mod Parent_'));
    assert.ok(output.includes('pub struct child'));
    assert.ok(output.includes('pub name: Option<String>,'));
    assert.ok(output.includes('pub age: Option<i64>,'));
  });

  test('array types', () => {
    const schemas: Record<string, VovkJSONSchemaBase> = {
      ArrayTypes: {
        type: 'object',
        properties: {
          stringArray: {
            type: 'array',
            items: { type: 'string' },
          },
          objectArray: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
              },
            },
          },
        },
      },
    } as const;

    const output = convertJSONSchemasToRustTypes({
      schemas,
      rootName: 'test',
    });

    assert.ok(output.includes('pub struct ArrayTypes'));
    assert.ok(output.includes('pub stringArray: Option<Vec<String>>,'));
    assert.ok(output.includes('pub objectArray: Option<Vec<ArrayTypes_::objectArrayItem>>,'));
    assert.ok(output.includes('pub struct objectArrayItem'));
  });

  test('required vs optional fields', () => {
    const schemas: Record<string, VovkJSONSchemaBase> = {
      MixedFields: {
        type: 'object',
        properties: {
          required1: { type: 'string' },
          required2: { type: 'integer' },
          optional1: { type: 'string' },
          optional2: { type: 'boolean' },
        },
        required: ['required1', 'required2'],
      },
    } as const;

    const output = convertJSONSchemasToRustTypes({
      schemas,
      rootName: 'test',
    });

    assert.ok(output.includes('pub required1: String,'));
    assert.ok(output.includes('pub required2: i64,'));
    assert.ok(output.includes('pub optional1: Option<String>,'));
    assert.ok(output.includes('pub optional2: Option<bool>,'));
  });

  test('enum generation', () => {
    const schemas: Record<string, VovkJSONSchemaBase> = {
      EnumContainer: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['pending', 'active', 'completed'],
          },
        },
      },
    } as const;

    const output = convertJSONSchemasToRustTypes({
      schemas,
      rootName: 'test',
    });

    assert.ok(output.includes('pub enum status'));
    assert.ok(output.includes('#[serde(rename = "pending")]'));
    assert.ok(output.includes('pending,'));
    assert.ok(output.includes('#[serde(rename = "active")]'));
    assert.ok(output.includes('active,'));
    assert.ok(output.includes('#[serde(rename = "completed")]'));
    assert.ok(output.includes('completed,'));
  });

  test('$ref resolution', () => {
    const schemas: Record<string, VovkJSONSchemaBase> = {
      User: {
        type: 'object',
        properties: {
          profile: { $ref: '#/$defs/Profile' },
        },
        $defs: {
          Profile: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
            },
          },
        },
      },
    } as const;

    const output = convertJSONSchemasToRustTypes({
      schemas,
      rootName: 'test',
    });

    assert.ok(output.includes('pub struct User'));
    // named refs point at the shared type instead of being inlined a second time
    assert.ok(output.includes('pub profile: Option<Profile>,'), output);
    assert.ok(output.includes('pub struct Profile'), output);
    assert.ok(!output.includes('pub struct profile'), output);
  });

  test('circular $ref', () => {
    const schemas: Record<string, VovkJSONSchemaBase> = {
      body: {
        type: 'object',
        properties: { user: { $ref: '#/$defs/User' } },
        required: ['user'],
        $defs: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              friend: { $ref: '#/$defs/User' },
              posts: { type: 'array', items: { $ref: '#/$defs/Post' } },
            },
            required: ['id'],
          },
          Post: {
            type: 'object',
            properties: { title: { type: 'string' }, author: { $ref: '#/$defs/User' } },
          },
        },
      },
    } as const;

    const output = convertJSONSchemasToRustTypes({ schemas, rootName: 'test' });

    // a self reference must be boxed to keep the struct sized
    assert.ok(output.includes('pub friend: Option<Box<User>>,'), output);
    // a Vec already breaks the cycle, so no Box there
    assert.ok(output.includes('pub posts: Option<Vec<Post>>,'), output);
    assert.ok(output.includes('pub author: Option<User>,'), output);
    assert.strictEqual(output.match(/pub struct User /g)?.length, 1, output);
  });

  test('named types are emitted once across slots', () => {
    const shared: VovkJSONSchemaBase = {
      type: 'object',
      properties: { user: { $ref: '#/$defs/User' } },
      $defs: { User: { type: 'object', properties: { id: { type: 'string' } } } },
    };

    const output = convertJSONSchemasToRustTypes({ schemas: { body: shared, output: shared }, rootName: 'test' });

    assert.strictEqual(output.match(/pub struct User /g)?.length, 1, output);
  });

  test('enum variants are valid Rust identifiers', () => {
    const schemas: Record<string, VovkJSONSchemaBase> = {
      body: {
        type: 'object',
        properties: {
          factor: { type: 'string', enum: ['2fa', 'ok'] },
          kw: { type: 'string', enum: ['type'] },
          dupes: { type: 'string', enum: ['a-b', 'a_b'] },
          blank: { type: 'string', enum: [''] },
        },
        required: ['factor', 'kw', 'dupes', 'blank'],
      },
    } as const;

    const output = convertJSONSchemasToRustTypes({ schemas, rootName: 'test' });

    assert.ok(output.includes('#[serde(rename = "2fa")]\n      _2fa,'), output);
    assert.ok(output.includes('#[serde(rename = "type")]\n      type_,'), output);
    assert.ok(output.includes('a_b,') && output.includes('a_b_2,'), output);
    assert.ok(output.includes('#[serde(rename = "")]\n      Empty,'), output);
  });

  test('field and named type names are valid Rust identifiers', () => {
    const schemas: Record<string, VovkJSONSchemaBase> = {
      body: {
        type: 'object',
        properties: {
          self: { type: 'string' },
          crate: { type: 'string' },
          'foo-bar': { type: 'string' },
          'foo.bar': { type: 'string' },
          sign: { type: 'string', enum: ['+', '-'] },
          ts: { $ref: '#/$defs/google.protobuf.Timestamp' },
        },
        $defs: {
          'google.protobuf.Timestamp': { type: 'object', properties: { seconds: { type: 'number' } } },
        },
      },
    } as const;

    const output = convertJSONSchemasToRustTypes({ schemas, rootName: 'test' });

    // r#self and r#crate are forbidden raw identifiers
    assert.ok(!output.includes('r#'), output);
    assert.ok(output.includes('#[serde(rename = "self")]\n    pub self_:'), output);
    assert.ok(output.includes('#[serde(rename = "crate")]\n    pub crate_:'), output);
    // colliding property names must not produce two fields of the same name
    assert.ok(output.includes('pub foo_bar:') && output.includes('pub foo_bar_2:'), output);
    // a variant that sanitizes to a bare "_" would be a reserved identifier
    assert.ok(!/^\s*_,$/m.test(output), output);
    // the named type and every reference to it agree on the sanitized name
    assert.ok(output.includes('pub struct google_protobuf_Timestamp {'), output);
    assert.ok(output.includes('pub ts: Option<google_protobuf_Timestamp>'), output);
    assert.ok(!output.includes('google.protobuf.Timestamp {'), output);
  });

  test('body kinds', () => {
    assert.strictEqual(getBodyKind(undefined), 'none');
    assert.strictEqual(getBodyKind({ type: 'string', 'x-contentType': ['text/plain'] }), 'text');
    assert.strictEqual(getBodyKind({ type: 'string', 'x-contentType': ['application/octet-stream'] }), 'binary');
    assert.strictEqual(getBodyKind({ type: 'string', 'x-contentType': ['image/png'] }), 'binary');
    assert.strictEqual(getBodyKind({ type: 'object', 'x-contentType': ['multipart/form-data'] }), 'form');
    assert.strictEqual(getBodyKind({ type: 'object', properties: {} }), 'json');

    const output = convertJSONSchemasToRustTypes({
      schemas: { body: { type: 'string', 'x-contentType': ['application/octet-stream'] } },
      rootName: 'test',
    });

    assert.ok(output.includes('pub type body = Vec<u8>;'), output);
  });

  test('anyOf/oneOf variants', () => {
    const schemas: Record<string, VovkJSONSchemaBase> = {
      VariantContainer: {
        type: 'object',
        properties: {
          data: {
            oneOf: [
              { type: 'string' },
              {
                type: 'object',
                properties: {
                  value: { type: 'integer' },
                },
              },
            ],
          },
        },
      },
    } as const;

    const output = convertJSONSchemasToRustTypes({
      schemas,
      rootName: 'test',
    });

    assert.ok(output.includes('pub enum data'));
    assert.ok(output.includes('#[serde(untagged)]'));
    assert.ok(output.includes('Variant0(String),'));
    assert.ok(output.includes('Variant1(') && output.includes('data') && output.includes('Variant1'));
  });

  test('empty schemas', () => {
    const output = convertJSONSchemasToRustTypes({
      schemas: {},
      rootName: 'test',
    });

    assert.strictEqual(output, '');

    const outputWithUndefined = convertJSONSchemasToRustTypes({
      schemas: { User: undefined },
      rootName: 'test',
    });

    assert.strictEqual(outputWithUndefined, '');
  });

  test('complex schema with multiple features', () => {
    const schema: Record<string, VovkJSONSchemaBase> = {
      ApiResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['success', 'error'] },
          code: { type: 'integer' },
          data: {
            oneOf: [
              {
                type: 'object',
                properties: {
                  users: {
                    type: 'array',
                    items: { $ref: '#/$defs/User' },
                  },
                },
              },
              {
                type: 'object',
                properties: {
                  error: { type: 'string' },
                },
              },
            ],
          },
        },
        required: ['status', 'code'],
        $defs: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              isActive: { type: 'boolean' },
              metadata: {
                type: 'object',
                additionalProperties: true,
              },
            },
            required: ['id', 'name'],
          },
        },
      },
    } as const;

    const output = convertJSONSchemasToRustTypes({
      schemas: schema,
      rootName: 'test',
    });

    assert.ok(output.includes('pub struct ApiResponse'));
    assert.ok(output.includes('User') || output.includes('users'));
    assert.ok(output.includes('pub enum status'));
    assert.ok(output.includes('pub enum data'));
    assert.ok(output.includes('pub status: ApiResponse_::status,'));
    assert.ok(output.includes('pub code: i64,'));

    const userRelatedOutput =
      output.includes('User') || output.includes('users') || output.includes('name:') || output.includes('name: ');

    assert.ok(userRelatedOutput, 'Expected User-related content not found in the output');
  });
});
