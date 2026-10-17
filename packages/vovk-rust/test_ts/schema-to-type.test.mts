import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { VovkJSONSchemaBase } from '../../vovk/src/index.js';
import {
  convertJSONSchemasToRustTypes,
  getBodyKind,
  toRustCommentText,
  toRustDocLines,
  toRustString,
} from '../index.js';

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
    // an unset optional field is left out instead of being sent as null
    const skip = '#[serde(default, skip_serializing_if = "Option::is_none")]';
    assert.ok(output.includes(`${skip}\n    pub optional1: Option<String>,`), output);
    assert.ok(!output.includes(`${skip}\n    pub required1:`), output);
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

  test('a form or JSON body goes out as JSON unless a field holds a file', () => {
    const fields = { n: { type: 'number' }, tags: { type: 'array', items: { type: 'string' } } } as const;
    const file = { type: 'string', format: 'binary' } as const;

    for (const form of ['multipart/form-data', 'application/x-www-form-urlencoded']) {
      const contentTypes = [form, 'application/json'];
      assert.strictEqual(
        getBodyKind({ type: 'object', properties: fields, 'x-contentType': contentTypes }),
        'json',
        form
      );
    }
    assert.strictEqual(
      getBodyKind({
        type: 'object',
        properties: { ...fields, file },
        'x-contentType': ['multipart/form-data', 'application/json'],
      }),
      'form'
    );
  });

  test('a mixin body of one schema as JSON or as a form is that schema, not a union', () => {
    const pet = { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] } as const;
    const bodies: VovkJSONSchemaBase[] = [
      {
        anyOf: [
          { $ref: '#/$defs/Pet', 'x-contentType': ['application/json'], 'x-tsType': 'Mixins.Pet' },
          { $ref: '#/$defs/Pet', 'x-contentType': ['application/x-www-form-urlencoded'], 'x-tsType': 'Mixins.Pet' },
        ],
        'x-contentType': ['application/json', 'application/x-www-form-urlencoded'],
        $defs: { Pet: pet },
      },
      {
        anyOf: [
          { ...pet, 'x-contentType': ['application/json'] },
          { ...pet, 'x-contentType': ['multipart/form-data'] },
        ],
        'x-contentType': ['application/json', 'multipart/form-data'],
      },
    ];
    for (const body of bodies) {
      const output = convertJSONSchemasToRustTypes({ schemas: { body }, rootName: 'test' });
      assert.ok(!output.includes('Variant'), output);
      assert.ok(output.includes('pub type body = Pet;') || output.includes('pub struct body {'), output);
    }
  });

  test('a field is a file by the rule the Python client uses', () => {
    // the same table is in the other client's tests: both read a field as a file by one rule
    const fileFields: [VovkJSONSchemaBase, boolean][] = [
      [{ type: 'string', format: 'binary' }, true],
      [{ type: 'string', contentEncoding: 'binary' }, true],
      [{ type: 'array', items: { type: 'string', format: 'binary' } }, true],
      [{ type: 'array', prefixItems: [{ type: 'string' }, { type: 'string', format: 'binary' }] }, true],
      // @ts-expect-error a draft 7 tuple
      [{ type: 'array', items: [{ type: 'string' }, { type: 'string', format: 'binary' }] }, true],
      [{ oneOf: [{ type: 'string', format: 'binary' }, { type: 'null' }] }, true],
      [{ allOf: [{ type: 'string' }, { format: 'binary' }] }, true],
      [{ type: 'array', items: { type: 'string' } }, false],
      [{ type: 'string', format: 'date-time' }, false],
    ];
    for (const [field, isFile] of fileFields) {
      const body: VovkJSONSchemaBase = {
        type: 'object',
        properties: { field },
        'x-contentType': ['multipart/form-data', 'application/json'],
      };
      assert.strictEqual(getBodyKind(body), isFile ? 'form' : 'json', JSON.stringify(field));
    }
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

describe('schema text never leaves its literal', () => {
  test('doc comments keep every line of a title or description behind ///', () => {
    const output = convertJSONSchemasToRustTypes({
      schemas: {
        body: {
          type: 'object',
          title: 'Thing\nfn injected() {}',
          description: 'a\r\nb\rc',
          properties: { a: { type: 'string' } },
        },
      },
      rootName: 'test',
    });

    assert.ok(output.includes('/// Thing\n'), output);
    assert.ok(output.includes('/// fn injected() {}\n'), output);
    assert.ok(output.includes('/// a\n') && output.includes('/// b\n') && output.includes('/// c\n'), output);
    assert.ok(!/^\s*fn injected/m.test(output), output);
  });

  test('helpers for templates', () => {
    assert.deepEqual(toRustDocLines('a\r\nb\u0000'), ['a', 'b ']);
    assert.equal(toRustCommentText('a\nfn x() {}'), 'a fn x() {}');
    assert.equal(toRustString('text/plain"; x \\ \n'), '"text/plain\\"; x \\\\ \\u{a}"');
  });
});

describe('type arrays', () => {
  test('["T", "null"] is an optional T, and several types are untyped', () => {
    const output = convertJSONSchemasToRustTypes({
      schemas: {
        output: {
          type: 'object',
          properties: {
            n: { type: ['integer', 'null'] },
            s: { type: ['string', 'null'], enum: ['a', null] },
            mixed: { type: ['string', 'number'] },
            list: { type: ['array', 'null'], items: { type: 'string' } },
            objects: { type: ['array', 'null'], items: { type: 'object', properties: { x: { type: 'string' } } } },
          },
          required: ['n', 's', 'mixed', 'list', 'objects'],
        },
      },
      rootName: 'test',
    });

    assert.ok(output.includes('pub n: Option<i64>,'), output);
    assert.ok(output.includes('pub s: Option<output_::s>,') && output.includes('pub enum s {'), output);
    assert.ok(output.includes('pub mixed: serde_json::Value,'), output);
    assert.ok(output.includes('pub list: Option<Vec<String>>,'), output);
    assert.ok(output.includes('pub objects: Option<Vec<output_::objectsItem>>,'), output);
    assert.ok(output.includes('pub struct objectsItem {'), output);
  });

  test('a bare $ref slot names the referenced type', () => {
    const output = convertJSONSchemasToRustTypes({
      schemas: {
        body: { $ref: '#/$defs/Thing', $defs: { Thing: { type: 'object', properties: { a: { type: 'string' } } } } },
      },
      rootName: 'test',
    });

    assert.ok(output.includes('pub struct Thing'), output);
    assert.ok(output.includes('pub type body = Thing;'), output);
  });
});

describe('schema shapes', () => {
  const convert = (schemas: Record<string, VovkJSONSchemaBase>) =>
    convertJSONSchemasToRustTypes({ schemas, rootName: 'test' });

  test('every type a field refers to is defined', () => {
    const output = convert({
      body: {
        type: 'object',
        properties: {
          a: { type: 'array', items: { type: 'string', enum: ['x', 'y'] } },
          e: { anyOf: [{ type: 'string', enum: ['a', 'b'] }, { type: 'null' }] },
          m: {
            type: 'array',
            items: { type: 'array', items: { type: 'object', properties: { x: { type: 'number' } } } },
          },
          u: { anyOf: [{ type: 'string', enum: ['p', 'q'] }, { type: 'number' }] },
        },
        required: ['a', 'e', 'm', 'u'],
      },
    });

    assert.ok(output.includes('pub a: Vec<body_::aItem>,') && output.includes('pub enum aItem {'), output);
    assert.ok(output.includes('pub e: Option<body_::e>,') && output.includes('pub enum e {'), output);
    assert.ok(
      output.includes('pub m: Vec<Vec<body_::mItemItem>>,') && output.includes('pub struct mItemItem {'),
      output
    );
    assert.ok(output.includes('Variant0(u_::Variant0),') && output.includes('pub enum Variant0 {'), output);
  });

  test('named schemas of any shape are types', () => {
    const output = convert({
      body: {
        type: 'object',
        properties: { tags: { $ref: '#/$defs/Tags' }, meta: { $ref: '#/$defs/Meta' }, n: { $ref: '#/$defs/Name' } },
        required: ['tags', 'meta', 'n'],
        $defs: {
          Tags: { type: 'array', items: { type: 'string' } },
          Meta: { type: 'object', additionalProperties: { type: 'string' } },
          Name: { type: ['string', 'null'] },
        },
      },
      output: {
        type: 'array',
        items: { $ref: '#/$defs/user-profile' },
        $defs: { 'user-profile': { type: 'object', properties: { name: { type: 'string' } } } },
      },
    });

    assert.ok(output.includes('pub type Tags = Vec<String>;'), output);
    assert.ok(output.includes('pub type Meta = std::collections::HashMap<String, String>;'), output);
    assert.ok(output.includes('pub type Name = Option<String>;'), output);
    assert.ok(output.includes('pub type output = Vec<user_profile>;'), output);
  });

  test('a named type keeps clear of the slot names and of the names Rust code relies on', () => {
    const output = convert({
      body: {
        type: 'object',
        properties: { x: { $ref: '#/$defs/body' }, String: { type: 'object', properties: { s: { type: 'string' } } } },
        required: ['x', 'String'],
        $defs: { body: { type: 'object', properties: { y: { type: 'string' } } } },
      },
    });

    assert.ok(output.includes('pub struct body_2 {') && output.includes('pub x: body_2,'), output);
    assert.ok(output.includes('pub String: body_::String_,') && output.includes('pub struct String_ {'), output);
  });

  test('numbers are f64, any value is serde_json::Value, a closed tuple is a tuple', () => {
    const output = convert({
      output: {
        type: 'object',
        properties: {
          price: { type: 'number', minimum: 0, maximum: 1e9 },
          meta: {},
          t: {
            type: 'array',
            prefixItems: [{ type: 'string' }, { type: 'number' }],
            items: false,
            minItems: 2,
            maxItems: 2,
          },
          open: { type: 'array', prefixItems: [{ type: 'string' }] },
        },
        required: ['price', 'meta', 't', 'open'],
      },
    });

    assert.ok(output.includes('pub price: f64,'), output);
    assert.ok(output.includes('pub meta: serde_json::Value,'), output);
    assert.ok(output.includes('pub t: (String, f64),'), output);
    assert.ok(output.includes('pub open: Vec<serde_json::Value>,'), output);
  });

  test('an enum of mixed values reads the others by type', () => {
    const output = convert({
      output: { type: 'object', properties: { m: { enum: ['a', 1, true] } }, required: ['m'] },
    });

    assert.ok(output.includes('#[serde(rename = "a")]\n      a,'), output);
    assert.ok(output.includes('#[serde(untagged)]\n      Number(serde_json::Number),'), output);
    assert.ok(output.includes('#[serde(untagged)]\n      Boolean(bool),'), output);
  });

  test('literals and comments keep carriage returns and direction controls out', () => {
    const output = convert({
      body: {
        type: 'object',
        description: 'Name \u202eevil',
        properties: { 'a\rb': { type: 'string', enum: ['x\u202ey'] } },
        required: ['a\rb'],
      },
    });

    assert.ok(output.includes('#[serde(rename = "a\\u{d}b")]'), output);
    assert.ok(output.includes('#[serde(rename = "x\\u{202e}y")]'), output);
    assert.ok(output.includes('/// Name  evil'), output);
    assert.ok(!/[\r\u202e]/u.test(output), output);
  });
});

describe('a union reads the variant the value belongs to', () => {
  const convert = (schemas: Record<string, VovkJSONSchemaBase>) =>
    convertJSONSchemasToRustTypes({ schemas, rootName: 'test' });
  // the source of each function a field or a variant names in deserialize_with
  const readers = (output: string, field: RegExp) =>
    [...output.matchAll(field)].map(([, name]) => {
      const start = output.indexOf(`fn ${name}<'de`);
      assert.ok(start !== -1, `no fn ${name}\n${output}`);
      return output.slice(start, output.indexOf('\n\n', start));
    });

  test('a constant field reads only its value, its type stays', () => {
    // z.discriminatedUnion, the shorter variant first
    const output = convert({
      output: {
        oneOf: [
          {
            type: 'object',
            properties: { status: { type: 'string', const: 'pending' } },
            required: ['status'],
            additionalProperties: false,
          },
          {
            type: 'object',
            properties: { status: { type: 'string', const: 'done' }, result: { type: 'number' } },
            required: ['status', 'result'],
            additionalProperties: false,
          },
        ],
      },
    });
    const [pending, done] = readers(output, /deserialize_with = "(\w+)"\)\]\n\s*pub status: String,/g);

    assert.match(pending, /-> ::std::result::Result<String, __D::Error>/);
    assert.match(pending, /if __value == "pending" \{/);
    assert.match(done, /if __value == "done" \{/);
    assert.ok(output.includes('pub result: f64,'), output);
  });

  test('a constant without a type, a boolean, a number and an optional constant', () => {
    // valibot and arktype leave the type out
    const output = convert({
      output: {
        anyOf: [
          {
            type: 'object',
            properties: { kind: { const: 'a' }, ok: { type: 'boolean', const: true }, n: { type: 'number', const: 2 } },
            required: ['kind', 'ok', 'n'],
          },
          {
            type: 'object',
            properties: { kind: { const: 'b' }, i: { type: 'integer', const: -1 } },
            required: ['kind'],
          },
        ],
      },
    });

    assert.match(readers(output, /deserialize_with = "(\w+)"\)\]\n\s*pub kind: String,/g)[1], /__value == "b"/);
    assert.match(readers(output, /deserialize_with = "(\w+)"\)\]\n\s*pub ok: bool,/g)[0], /__value == true/);
    assert.match(readers(output, /deserialize_with = "(\w+)"\)\]\n\s*pub n: f64,/g)[0], /__value == 2\.0/);
    const [optional] = readers(output, /deserialize_with = "(\w+)"\)\]\n\s*pub i: Option<i64>,/g);
    assert.match(optional, /-> ::std::result::Result<Option<i64>, __D::Error>/);
    // an unset optional field reads as None
    assert.match(optional, /__value\.as_ref\(\)\.map_or\(true, \|__v\| \*__v == -1\)/);
  });

  test('a union of constants reads each through its own check', () => {
    // z.union([z.literal('a'), z.literal('b')])
    const output = convert({
      output: {
        type: 'object',
        properties: {
          l: {
            anyOf: [
              { type: 'string', const: 'a' },
              { type: 'string', const: 'b' },
            ],
          },
        },
        required: ['l'],
      },
    });
    const [a, b] = readers(output, /Variant\d\(#\[serde\(deserialize_with = "(\w+)"\)\] String\),/g);

    assert.match(a, /__value == "a"/);
    assert.match(b, /__value == "b"/);
  });

  test('an OpenAPI discriminator picks the variant its value names', () => {
    const output = convert({
      output: {
        type: 'object',
        properties: { pet: { $ref: '#/$defs/AnyPet' }, event: { $ref: '#/$defs/Event' } },
        required: ['pet', 'event'],
        $defs: {
          AnyPet: {
            oneOf: [{ $ref: '#/$defs/Cat' }, { $ref: '#/$defs/Dog' }],
            discriminator: { propertyName: 'petType' },
          },
          Cat: { allOf: [{ $ref: '#/$defs/Pet' }, { type: 'object', properties: { lives: { type: 'integer' } } }] },
          Dog: { allOf: [{ $ref: '#/$defs/Pet' }, { type: 'object', properties: { bark: { type: 'boolean' } } }] },
          Pet: { type: 'object', properties: { name: { type: 'string' }, petType: { type: 'string' } } },
          Event: {
            oneOf: [{ $ref: '#/$defs/Created' }, { $ref: '#/$defs/Deleted' }],
            discriminator: {
              propertyName: 'type',
              mapping: { created: '#/components/schemas/Created', deleted: 'Deleted' },
            },
          },
          Created: { type: 'object', properties: { type: { type: 'string' } } },
          Deleted: { type: 'object', properties: { type: { type: 'string' }, reason: { type: 'string' } } },
        },
      } as VovkJSONSchemaBase,
    });
    const impl = (name: string) => {
      const start = output.indexOf(`impl<'de> serde::Deserialize<'de> for ${name} {`);
      assert.ok(start !== -1, output);
      return output.slice(start, output.indexOf('\n  }\n', start));
    };

    assert.ok(
      output.includes(
        '#[derive(Debug, Serialize, Clone)]\n  #[allow(non_camel_case_types)]\n  #[serde(untagged)]\n  pub enum AnyPet {'
      ),
      output
    );
    assert.match(impl('AnyPet'), /__value\.get\("petType"\)/);
    assert.match(impl('AnyPet'), /"Cat" => 0,\n\s*"Dog" => 1,\n\s*_ => 2,/);
    assert.match(impl('Event'), /"created" => 0,\n\s*"deleted" => 1,/);
    // a variant the mapping names is still named by its component name too
    assert.match(impl('Event'), /"Deleted" => 1,/);
  });

  test('a union without a discriminator keeps the derived reader', () => {
    const output = convert({
      output: { oneOf: [{ type: 'string' }, { type: 'object', properties: { a: { type: 'string' } } }] },
    });

    assert.ok(output.includes('#[derive(Debug, Serialize, Deserialize, Clone)]'), output);
    assert.ok(!output.includes('impl<'), output);
  });
});

describe('a named schema in two slots', () => {
  const convert = (schemas: Record<string, VovkJSONSchemaBase>) =>
    convertJSONSchemasToRustTypes({ schemas, rootName: 'test' });

  test('two unnamed recursive schemas of one name get a type each', () => {
    // zod names the first unnamed recursive schema of each slot __schema0, valibot names it "0"
    const output = convert({
      body: JSON.parse(
        '{"type":"object","properties":{"cat":{"$ref":"#/$defs/__schema0"}},"required":["cat"],"$defs":{"__schema0":{"type":"object","properties":{"name":{"type":"string"},"children":{"type":"array","items":{"$ref":"#/$defs/__schema0"}}},"required":["name","children"]}}}'
      ),
      output: JSON.parse(
        '{"type":"object","properties":{"c":{"$ref":"#/$defs/__schema0"}},"required":["c"],"additionalProperties":false,"$defs":{"__schema0":{"type":"object","properties":{"text":{"type":"string"},"likes":{"type":"number"},"replies":{"type":"array","items":{"$ref":"#/$defs/__schema0"}}},"required":["text","likes","replies"],"additionalProperties":false}}}'
      ),
    });

    assert.ok(output.includes('pub struct __schema0 {') && output.includes('pub struct __schema0_2 {'), output);
    assert.ok(output.includes('pub cat: __schema0,') && output.includes('pub children: Vec<__schema0>,'), output);
    assert.ok(output.includes('pub c: __schema0_2,') && output.includes('pub replies: Vec<__schema0_2>,'), output);
  });

  test('a def that refers to a def of its own slot gets its own type with it', () => {
    const slot = (field: string) =>
      JSON.parse(
        `{"$ref":"#/$defs/A","$defs":{"A":{"type":"object","properties":{"b":{"$ref":"#/$defs/B"}},"required":["b"]},"B":{"type":"object","properties":{"${field}":{"type":"string"}},"required":["${field}"]}}}`
      );
    const output = convert({ body: slot('x'), output: slot('y') });

    assert.ok(output.includes('pub b: B,') && output.includes('pub x: String,'), output);
    assert.ok(output.includes('pub struct A_2 {') && output.includes('pub b: B_2,'), output);
    assert.ok(output.includes('pub y: String,') && output.includes('pub type output = A_2;'), output);
  });

  test('the input and output forms of one schema share its type', () => {
    // a zod schema with .meta({ id: 'User' }): a default and a transform differ between input and output
    const output = convert({
      body: JSON.parse(
        '{"type":"object","properties":{"u":{"$ref":"#/$defs/User"}},"required":["u"],"$defs":{"User":{"type":"object","properties":{"id":{"type":"string"},"role":{"default":"user","type":"string"},"n":{"type":"string"}},"required":["id"]}}}'
      ),
      output: JSON.parse(
        '{"type":"object","properties":{"u":{"$ref":"#/$defs/User"}},"required":["u"],"additionalProperties":false,"$defs":{"User":{"type":"object","properties":{"id":{"type":"string"},"role":{"default":"user","type":"string"},"n":{}},"required":["id","role","n"],"additionalProperties":false}}}'
      ),
    });

    assert.strictEqual(output.match(/pub struct User /g)?.length, 1, output);
    assert.ok(!output.includes('User_2'), output);
  });
});

describe('a recursive named schema that is not a struct or an enum', () => {
  const convert = (schemas: Record<string, VovkJSONSchemaBase>) =>
    convertJSONSchemasToRustTypes({ schemas, rootName: 'test' });

  test('becomes a newtype: rustc rejects a recursive type alias', () => {
    const output = convert({
      // z.record(z.string(), z.lazy(() => Tree))
      body: JSON.parse(
        '{"type":"object","properties":{"t":{"$ref":"#/$defs/__schema0"}},"required":["t"],"$defs":{"__schema0":{"type":"object","propertyNames":{"type":"string"},"additionalProperties":{"$ref":"#/$defs/__schema0"}}}}'
      ),
      output: {
        type: 'object',
        properties: {
          m: { $ref: '#/$defs/Nested' },
          a: { $ref: '#/$defs/A' },
          n: { $ref: '#/$defs/N' },
          p: { $ref: '#/$defs/P' },
          o: { $ref: '#/$defs/O' },
        },
        required: ['m', 'a', 'n', 'p', 'o'],
        $defs: {
          Nested: { type: 'array', items: { $ref: '#/$defs/Nested' } },
          A: { type: 'array', items: { $ref: '#/$defs/B' } },
          B: { type: 'object', additionalProperties: { $ref: '#/$defs/A' } },
          N: { anyOf: [{ type: 'array', items: { $ref: '#/$defs/N' } }, { type: 'null' }] },
          P: {
            type: 'array',
            prefixItems: [{ type: 'string' }, { type: 'array', items: { $ref: '#/$defs/P' } }],
            items: false,
            minItems: 2,
          },
          O: { anyOf: [{ $ref: '#/$defs/O' }, { type: 'null' }] },
        },
      },
    });
    const newtype = (name: string, type: string) => `#[serde(transparent)]\n  pub struct ${name}(pub ${type});`;

    assert.ok(output.includes(newtype('__schema0', 'std::collections::HashMap<String, __schema0>')), output);
    assert.ok(output.includes(newtype('Nested', 'Vec<Nested>')), output);
    assert.ok(output.includes(newtype('A', 'Vec<B>')), output);
    assert.ok(output.includes(newtype('B', 'std::collections::HashMap<String, A>')), output);
    assert.ok(output.includes(newtype('N', 'Option<Vec<N>>')), output);
    assert.ok(output.includes(newtype('P', '(String, Vec<P>)')), output);
    assert.ok(output.includes(newtype('O', 'Option<Box<O>>')), output);
  });

  test('stays an alias when nothing recurses, or when a struct comes between', () => {
    const output = convert({
      body: {
        type: 'object',
        properties: { tags: { $ref: '#/$defs/Tags' }, l: { $ref: '#/$defs/L' }, open: { $ref: '#/$defs/Open' } },
        required: ['tags', 'l', 'open'],
        $defs: {
          Tags: { type: 'array', items: { type: 'string' } },
          L: { type: 'array', items: { type: 'object', properties: { next: { $ref: '#/$defs/L' } } } },
          // an open tuple is a list of any value, the reference is not in its type
          Open: { type: 'array', prefixItems: [{ $ref: '#/$defs/Open' }] },
        },
      },
    });

    assert.ok(output.includes('pub type Tags = Vec<String>;'), output);
    assert.ok(output.includes('pub type L = Vec<LItem>;'), output);
    assert.ok(output.includes('pub type Open = Vec<serde_json::Value>;'), output);
    assert.ok(!output.includes('transparent'), output);
  });
});
