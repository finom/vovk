import { describe, it } from 'node:test';
import { deepStrictEqual, ok, strictEqual } from 'node:assert';
import { applyComponentsSchemas, openAPIToVovkSchema, reattachMixinDefs } from 'vovk/internal';

// Loose aliases to keep assertions readable without deep schema typing.
type Obj = Record<string, any>;
type Seg = any;

// Minimal spec: component `Shared` (which refs `Nested`) is the response of TWO ops
// (one JSON output, one JSONL iteration), plus a request body referencing `CreateThing`.
const spec = {
  openapi: '3.1.0',
  info: { title: 'Test', version: '1.0.0' },
  paths: {
    '/things': {
      get: {
        operationId: 'getThings',
        responses: { '200': { content: { 'application/json': { schema: { $ref: '#/components/schemas/Shared' } } } } },
      },
      post: {
        operationId: 'createThing',
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateThing' } } } },
        responses: { '200': { content: { 'application/json': { schema: { $ref: '#/components/schemas/Shared' } } } } },
      },
    },
    '/stream': {
      get: {
        operationId: 'streamThings',
        responses: { '200': { content: { 'application/jsonl': { schema: { $ref: '#/components/schemas/Shared' } } } } },
      },
    },
  },
  components: {
    schemas: {
      Shared: {
        type: 'object',
        properties: { id: { type: 'string' }, nested: { $ref: '#/components/schemas/Nested' } },
      },
      Nested: { type: 'object', properties: { value: { type: 'number' } } },
      CreateThing: { type: 'object', properties: { name: { type: 'string' } } },
    },
  },
};

function build() {
  return openAPIToVovkSchema({
    apiRoot: 'https://api.example.com',
    source: { object: spec },
    getModuleName: () => 'Test',
    getMethodName: ({ operationObject }: { operationObject: { operationId?: string } }) =>
      operationObject.operationId ?? 'op',
    segmentName: 'api',
  } as unknown as Parameters<typeof openAPIToVovkSchema>[0]);
}

describe('openAPIToVovkSchema — mixin $defs dedup', () => {
  it('stores response slots (output/iteration) as pointer-only: $ref + x-tsType, no $defs', () => {
    const segment = build().segments.api as Seg;
    const handlers = segment.controllers.Test.handlers;

    const output = handlers.getThings.validation.output;
    strictEqual(output.$ref, '#/components/schemas/Shared', 'output keeps the components/schemas ref');
    strictEqual(output['x-tsType'], 'Mixins.Api.Shared', 'output carries the Mixins x-tsType hint');
    strictEqual(output.$defs, undefined, 'output must NOT embed $defs');

    const iteration = handlers.streamThings.validation.iteration;
    strictEqual(iteration.$ref, '#/components/schemas/Shared', 'iteration keeps the components/schemas ref');
    strictEqual(iteration['x-tsType'], 'Mixins.Api.Shared', 'iteration carries the Mixins x-tsType hint');
    strictEqual(iteration.$defs, undefined, 'iteration must NOT embed $defs');
  });

  it('keeps request slots (body) self-contained: $ref rewritten to #/$defs + $defs populated', () => {
    const segment = build().segments.api as Seg;
    const body = segment.controllers.Test.handlers.createThing.validation.body;
    strictEqual(body.$ref, '#/$defs/CreateThing', 'body ref rewritten to local $defs');
    ok(body.$defs?.CreateThing, 'body embeds its component in $defs (needed for runtime AJV)');
  });

  it('does not duplicate the component closure across handlers', () => {
    const segment = build().segments.api as Seg;
    const handlers = segment.controllers.Test.handlers;
    for (const name of ['getThings', 'createThing'] as const) {
      strictEqual(handlers[name].validation.output?.$defs, undefined, `${name}.output has no $defs`);
    }
    strictEqual(handlers.streamThings.validation.iteration?.$defs, undefined, 'streamThings.iteration has no $defs');
    ok(segment.meta.openAPIObject.components.schemas.Shared, 'Shared present once in meta');
    ok(segment.meta.openAPIObject.components.schemas.Nested, 'Nested present once in meta');
  });
});

describe('reattachMixinDefs — render-time reconstitution (Rust)', () => {
  it('reconstitutes a deduped output slot to the exact pre-dedup self-contained schema', () => {
    const segment = build().segments.api as Seg;
    const stored = segment.controllers.Test.handlers.getThings.validation.output;

    const reattached = reattachMixinDefs(stored, segment) as Obj;
    strictEqual(reattached.$ref, '#/$defs/Shared', 'ref rewritten to local $defs');
    ok(reattached.$defs?.Shared, 'Shared embedded');
    ok(reattached.$defs?.Nested, 'transitive Nested embedded');

    // Identity: reattaching == what emitDefs=true would have produced inline originally.
    const inline = applyComponentsSchemas(
      { $ref: '#/components/schemas/Shared', 'x-tsType': 'Mixins.Api.Shared' } as Obj,
      spec.components.schemas as Obj,
      'api',
      true
    );
    deepStrictEqual(reattached, inline, 'reconstituted slot equals the original self-contained slot');
  });

  it('is a no-op for non-mixin segments', () => {
    const slot = { $ref: '#/components/schemas/Shared', 'x-tsType': 'Mixins.Api.Shared' } as Obj;
    const out = reattachMixinDefs(slot, { segmentType: 'segment', segmentName: 'x' });
    strictEqual(out, slot, 'returns the slot unchanged for non-mixin segments');
  });
});
