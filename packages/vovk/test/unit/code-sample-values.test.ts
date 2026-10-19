import { ok, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import type { VovkSchema } from 'vovk';
import { createCodeSamples, type VovkStrictConfig, vovkSchemaToOpenAPI } from 'vovk/internal';

// biome-ignore lint/suspicious/noExplicitAny: loose test alias for readable schemas
type Obj = Record<string, any>;

const samplesFor = (body: Obj) =>
  createCodeSamples({
    handlerName: 'create',
    handlerSchema: { httpMethod: 'POST', path: '', validation: { body } },
    controllerSchema: { rpcModuleName: 'ThingRPC', prefix: 'things', handlers: {} },
    package: { name: 'acme' },
    config: {},
  });

describe('The values in the code samples', () => {
  it('Leave out what a circular schema repeats, so the value fits the type', () => {
    const tree = {
      $defs: {
        Node: {
          type: 'object',
          properties: { name: { type: 'string' }, children: { type: 'array', items: { $ref: '#/$defs/Node' } } },
          required: ['name', 'children'],
        },
      },
      type: 'object',
      properties: { root: { $ref: '#/$defs/Node' } },
      required: ['root'],
    };
    const { ts, py, rs } = samplesFor(tree);
    for (const code of [ts, py, rs]) ok(!/\[\s*(null|None)\s*\]/.test(code), code);
    ok(/children: \[\]/.test(ts), ts);
    ok(/"children": \[\]/.test(py), py);
    ok(/"children": \[\]/.test(rs), rs);
  });

  it('Gives a record of itself no entry where it repeats', () => {
    const record = { $ref: '#/$defs/R', $defs: { R: { type: 'object', additionalProperties: { $ref: '#/$defs/R' } } } };
    const { rs } = samplesFor(record);
    ok(rs.includes('from_value(json!({})).unwrap(), /* body */'), rs);
  });

  it('Gives strings the length the schema asks for', () => {
    const { ts } = samplesFor({
      type: 'object',
      properties: { short: { type: 'string', maxLength: 5 }, long: { type: 'string', minLength: 10 } },
      required: ['short', 'long'],
    });
    const short = ts.match(/short: ["']([^"']*)["']/)?.[1] ?? '';
    const long = ts.match(/long: ["']([^"']*)["']/)?.[1] ?? '';
    ok(short.length > 0 && short.length <= 5, ts);
    ok(long.length >= 10, ts);
    strictEqual(short, 'strin');
  });

  it('Give a schema with a list of types a value of its first type that is not null', () => {
    const { ts, py, rs } = samplesFor({
      type: ['null', 'object', 'array'],
      properties: { k: { type: 'string' } },
      required: ['k'],
    });
    ok(/body: \{\s*k: "string"\s*\}/.test(ts), ts);
    ok(/body=\{\s*"k": "string"\s*\}/.test(py), py);
    ok(/json!\(\{\s*"k": "string"\s*\}\)/.test(rs), rs);
  });

  it('Keep the fields an allOf shares with its oneOf member', () => {
    const { ts, py, rs } = samplesFor({
      allOf: [
        { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
        {
          oneOf: [
            { type: 'object', properties: { k: { const: 'a' }, a: { type: 'string' } }, required: ['k', 'a'] },
            { type: 'object', properties: { k: { const: 'b' }, b: { type: 'number' } }, required: ['k', 'b'] },
          ],
        },
      ],
    });
    ok(/id: "string"/.test(ts) && /k: "a"/.test(ts) && /a: "string"/.test(ts), ts);
    ok(/"id": "string"/.test(py) && /"k": "a"/.test(py), py);
    ok(/"id": "string"/.test(rs) && /"k": "a"/.test(rs), rs);
  });

  it('Keep the own fields of an object next to its oneOf', () => {
    const { ts } = samplesFor({
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
      oneOf: [
        { type: 'object', properties: { radius: { type: 'number' } }, required: ['radius'] },
        { type: 'object', properties: { side: { type: 'number' } }, required: ['side'] },
      ],
    });
    ok(/id: "string"/.test(ts) && /radius: 0/.test(ts), ts);
  });

  it('Leave out of the Rust sample an example that does not fit the type or the range', () => {
    const { rs, ts } = samplesFor({
      type: 'object',
      properties: {
        big: { type: 'integer', format: 'int64', example: '123' },
        count: { type: 'integer', minimum: 0, example: -1 },
        whole: { type: 'integer', example: 1.5 },
        nums: { type: 'number', exclusiveMaximum: 10, examples: [10, 7] },
        good: { type: 'integer', minimum: 1, example: 5 },
      },
      required: ['big', 'count', 'whole', 'nums', 'good'],
    });
    ok(/"big": 0,/.test(rs), rs);
    ok(/"count": 0,/.test(rs), rs);
    ok(/"whole": 0,/.test(rs), rs);
    ok(/"nums": 7,/.test(rs), rs);
    ok(/"good": 5\n/.test(rs), rs);
    // the TypeScript sample keeps the example as written
    ok(/big: "123"/.test(ts), ts);
  });

  it('Leave out what a circular schema repeats in the OpenAPI JSON Lines example', () => {
    const node = {
      type: 'object',
      properties: { name: { type: 'string' }, children: { type: 'array', items: { $ref: '#/$defs/Node' } } },
      required: ['name', 'children'],
    };
    const schema = {
      $schema: 'https://vovk.dev/schema',
      segments: {
        '': {
          $schema: 'https://vovk.dev/segment',
          segmentName: '',
          emitSchema: true,
          segmentType: 'segment',
          controllers: {
            TreeRPC: {
              rpcModuleName: 'TreeRPC',
              prefix: 'trees',
              handlers: {
                stream: {
                  path: '',
                  httpMethod: 'GET',
                  operationObject: { summary: 'stream' },
                  validation: { iteration: { $ref: '#/$defs/Node', $defs: { Node: node } } },
                },
              },
            },
          },
        },
      },
    } as unknown as VovkSchema;
    const { paths } = vovkSchemaToOpenAPI({
      config: undefined as unknown as VovkStrictConfig,
      schema,
      outputConfigs: [],
      isBundle: false,
      segmentName: null,
      projectPackageJson: undefined,
    }).openAPIObject as Obj;
    const example: string = paths['/api/trees'].get.responses['200'].content['application/jsonl'].example;
    strictEqual(example.split('\n')[0], '{"name":"string","children":[]}');
  });
});
