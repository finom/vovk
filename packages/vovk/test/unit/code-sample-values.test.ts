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
