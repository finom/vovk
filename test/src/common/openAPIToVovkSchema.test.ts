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
      Orphan: { type: 'object', properties: { unused: { type: 'boolean' } } },
    },
  },
};

function build(extra: Obj = {}) {
  return openAPIToVovkSchema({
    apiRoot: 'https://api.example.com',
    source: { object: spec },
    getModuleName: () => 'Test',
    getMethodName: ({ operationObject }: { operationObject: { operationId?: string } }) =>
      operationObject.operationId ?? 'op',
    segmentName: 'api',
    ...extra,
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

describe('openAPIToVovkSchema — filterOperations', () => {
  it('keeps only operations the predicate accepts (by method)', () => {
    const segment = build({ filterOperations: ({ method }: Obj) => method === 'GET' }).segments.api as Seg;
    const handlers = segment.controllers.Test.handlers;
    deepStrictEqual(Object.keys(handlers).sort(), ['getThings', 'streamThings'], 'POST createThing is absent');
  });

  it('keeps only operations the predicate accepts (by path)', () => {
    const segment = build({ filterOperations: ({ path }: Obj) => path === '/stream' }).segments.api as Seg;
    const handlers = segment.controllers.Test.handlers;
    deepStrictEqual(Object.keys(handlers), ['streamThings'], 'only the /stream operation survives');
  });

  it('never creates a module whose operations are all filtered out', () => {
    const segment = build({ filterOperations: () => false }).segments.api as Seg;
    deepStrictEqual(segment.controllers, {}, 'no empty controller entries');
  });

  it('defaults (no filter, no prune) keep every operation and every component', () => {
    const segment = build().segments.api as Seg;
    deepStrictEqual(Object.keys(segment.controllers.Test.handlers).sort(), [
      'createThing',
      'getThings',
      'streamThings',
    ]);
    deepStrictEqual(Object.keys(segment.meta.openAPIObject.components.schemas).sort(), [
      'CreateThing',
      'Nested',
      'Orphan',
      'Shared',
    ]);
  });
});

describe('openAPIToVovkSchema — pruneComponents', () => {
  it('drops components nothing references, keeps the transitive closure', () => {
    const segment = build({ pruneComponents: true }).segments.api as Seg;
    deepStrictEqual(
      Object.keys(segment.meta.openAPIObject.components.schemas).sort(),
      ['CreateThing', 'Nested', 'Shared'],
      'Orphan pruned; Nested kept transitively via Shared'
    );
  });

  it('drops components referenced only by filtered-out operations', () => {
    const segment = build({
      filterOperations: ({ method }: Obj) => method === 'GET',
      pruneComponents: true,
    }).segments.api as Seg;
    deepStrictEqual(
      Object.keys(segment.meta.openAPIObject.components.schemas).sort(),
      ['Nested', 'Shared'],
      'CreateThing (only used by the filtered-out POST) and Orphan pruned'
    );
  });

  it('keeps the response closure of kept operations', () => {
    const segment = build({
      filterOperations: ({ method }: Obj) => method === 'POST',
      pruneComponents: true,
    }).segments.api as Seg;
    deepStrictEqual(
      Object.keys(segment.meta.openAPIObject.components.schemas).sort(),
      ['CreateThing', 'Nested', 'Shared'],
      'createThing needs CreateThing (body) and Shared→Nested (its 200 response)'
    );
  });

  it('reattachMixinDefs still reconstitutes response slots from the pruned meta', () => {
    const segment = build({
      filterOperations: ({ method }: Obj) => method === 'GET',
      pruneComponents: true,
    }).segments.api as Seg;
    const reattached = reattachMixinDefs(segment.controllers.Test.handlers.getThings.validation.output, segment) as Obj;
    strictEqual(reattached.$ref, '#/$defs/Shared', 'ref rewritten to local $defs');
    ok(reattached.$defs?.Shared, 'Shared re-embedded after pruning');
    ok(reattached.$defs?.Nested, 'transitive Nested re-embedded after pruning');
  });

  it('does not mutate the input spec', () => {
    build({ filterOperations: () => false, pruneComponents: true });
    deepStrictEqual(
      Object.keys(spec.components.schemas).sort(),
      ['CreateThing', 'Nested', 'Orphan', 'Shared'],
      'the caller-owned spec keeps its full components dict'
    );
  });
});
