import assert from 'node:assert';
import { test, describe } from 'node:test';
import { convertJSONSchemasToRustTypes } from '../index.js';

describe('convertJSONSchemasToRustTypes', () => {
  test('basic primitive types', () => {
    const schema = {
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
      schemas: schema,
      rootName: 'test',
    });

    assert.ok(output.includes('pub struct BasicTypes'));
    assert.ok(output.includes('pub stringProp: String,'));
    assert.ok(output.includes('pub numberProp: Option<f64>,'));
    assert.ok(output.includes('pub integerProp: Option<i64>,'));
    assert.ok(output.includes('pub booleanProp: bool,'));
  });

  test('nested objects', () => {
    const schema = {
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
    };

    const output = convertJSONSchemasToRustTypes({
      schemas: schema,
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
    const schema = {
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
    };

    const output = convertJSONSchemasToRustTypes({
      schemas: schema,
      rootName: 'test',
    });

    assert.ok(output.includes('pub struct ArrayTypes'));
    assert.ok(output.includes('pub stringArray: Option<Vec<String>>,'));
    assert.ok(output.includes('pub objectArray: Option<Vec<ArrayTypes_::objectArrayItem>>,'));
    assert.ok(output.includes('pub struct objectArrayItem'));
  });

  test('required vs optional fields', () => {
    const schema = {
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
    };

    const output = convertJSONSchemasToRustTypes({
      schemas: schema,
      rootName: 'test',
    });

    assert.ok(output.includes('pub required1: String,'));
    assert.ok(output.includes('pub required2: i64,'));
    assert.ok(output.includes('pub optional1: Option<String>,'));
    assert.ok(output.includes('pub optional2: Option<bool>,'));
  });

  test('enum generation', () => {
    const schema = {
      EnumContainer: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['pending', 'active', 'completed'],
          },
        },
      },
    };

    const output = convertJSONSchemasToRustTypes({
      schemas: schema,
      rootName: 'test',
    });

    assert.ok(output.includes('pub enum statusEnum'));
    assert.ok(output.includes('#[serde(rename = "pending")]'));
    assert.ok(output.includes('pending,'));
    assert.ok(output.includes('#[serde(rename = "active")]'));
    assert.ok(output.includes('active,'));
    assert.ok(output.includes('#[serde(rename = "completed")]'));
    assert.ok(output.includes('completed,'));
  });

  test('$ref resolution', () => {
    const schema = {
      User: {
        type: 'object',
        properties: {
          profile: { $ref: '#/$defs/Profile' },
        },
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
    };

    const output = convertJSONSchemasToRustTypes({
      schemas: schema,
      rootName: 'test',
    });

    assert.ok(output.includes('pub struct User'));
    assert.ok(output.includes('pub profile: Option<Profile>,') || output.includes('pub profile: Option<String>,'));
    assert.ok(output.includes('Profile'));
  });

  test('anyOf/oneOf variants', () => {
    const schema = {
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
    };

    const output = convertJSONSchemasToRustTypes({
      schemas: schema,
      rootName: 'test',
    });

    assert.ok(output.includes('pub enum dataEnum'));
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
    const schema = {
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
      },
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
    };

    const output = convertJSONSchemasToRustTypes({
      schemas: schema,
      rootName: 'test',
    });

    assert.ok(output.includes('pub struct ApiResponse'));
    assert.ok(output.includes('User') || output.includes('users'));
    assert.ok(output.includes('pub enum statusEnum'));
    assert.ok(output.includes('pub enum dataEnum'));
    assert.ok(output.includes('pub status: ApiResponse_::statusEnum,'));
    assert.ok(output.includes('pub code: i64,'));

    const userRelatedOutput =
      output.includes('User') || output.includes('users') || output.includes('name:') || output.includes('name: ');

    assert.ok(userRelatedOutput, 'Expected User-related content not found in the output');
  });
});
