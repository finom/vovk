import { deepStrictEqual, ok, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { applyComponentsSchemas, openAPIToVovkSchema, reattachMixinDefs } from 'vovk/internal';

// Loose aliases to keep assertions readable without deep schema typing.
// biome-ignore lint/suspicious/noExplicitAny: loose test alias for readable assertions
type Obj = Record<string, any>;
// biome-ignore lint/suspicious/noExplicitAny: loose test alias for readable assertions
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

describe('openAPIToVovkSchema — untrusted x-tsType', () => {
  // compileTs emits x-tsType verbatim as TS, a spec that supplies one could inject statements
  const payload = 'any };\nconsole.log("PWNED");\ntype Dummy = { x: any';

  const evilSpec = {
    openapi: '3.1.0',
    info: { title: 'Evil', version: '1.0.0' },
    paths: {
      '/thing': {
        get: {
          operationId: 'getThing',
          parameters: [{ name: 'q', in: 'query', schema: { type: 'string', 'x-tsType': payload } }],
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: { type: 'object', properties: { id: { type: 'string', 'x-tsType': payload } } },
                },
              },
            },
          },
        },
      },
    },
  };

  function collectTsTypes(value: unknown, found: string[] = []): string[] {
    if (Array.isArray(value)) {
      for (const item of value) collectTsTypes(item, found);
    } else if (value && typeof value === 'object') {
      for (const [key, val] of Object.entries(value)) {
        if (key === 'x-tsType' && typeof val === 'string') found.push(val);
        collectTsTypes(val, found);
      }
    }
    return found;
  }

  it('drops an x-tsType supplied by the spec', () => {
    const schema = openAPIToVovkSchema({
      apiRoot: 'https://evil.example',
      source: { object: evilSpec },
      getModuleName: () => 'Evil',
      getMethodName: ({ operationObject }: { operationObject: { operationId?: string } }) =>
        operationObject.operationId ?? 'op',
      segmentName: 'api',
    } as unknown as Parameters<typeof openAPIToVovkSchema>[0]);

    ok(
      !collectTsTypes(schema).some((value) => value.includes('PWNED')),
      'no x-tsType from the spec survives into the schema'
    );
  });

  it('still sets its own x-tsType for component refs', () => {
    const tsTypes = collectTsTypes(build());
    ok(
      tsTypes.some((value) => value.startsWith('Mixins.')),
      `expected a Mixins.* value, got ${JSON.stringify(tsTypes)}`
    );
  });
});

// same `{ ok: boolean }` body everywhere, only status and media type vary
const responseSpec = {
  openapi: '3.1.0',
  info: { title: 'Responses', version: '1.0.0' },
  paths: {
    '/wildcard': {
      get: {
        operationId: 'wildcard',
        responses: { '2XX': { content: { 'application/json': { schema: okSchema() } } } },
      },
    },
    '/vendor': {
      get: {
        operationId: 'vendor',
        responses: { '200': { content: { 'application/vnd.github+json': { schema: okSchema() } } } },
      },
    },
    '/charset': {
      get: {
        operationId: 'charset',
        responses: { '200': { content: { 'application/json; charset=utf-8': { schema: okSchema() } } } },
      },
    },
    '/accepted': {
      get: {
        operationId: 'accepted',
        responses: { '202': { content: { 'application/json': { schema: okSchema() } } } },
      },
    },
    '/fallthrough': {
      get: {
        operationId: 'fallthrough',
        responses: {
          '200': { content: { 'text/plain': { schema: { type: 'string' } } } },
          '201': { content: { 'application/json': { schema: okSchema() } } },
        },
      },
    },
    '/prefer-exact': {
      get: {
        operationId: 'preferExact',
        responses: {
          '200': {
            content: {
              'application/hal+json': { schema: { type: 'object', properties: { hal: { type: 'boolean' } } } },
              'application/json': { schema: okSchema() },
            },
          },
        },
      },
    },
    '/error-only': {
      get: {
        operationId: 'errorOnly',
        responses: {
          '204': {},
          default: {
            content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' } } } } },
          },
        },
      },
    },
    '/stream-wildcard': {
      get: {
        operationId: 'streamWildcard',
        responses: { '2XX': { content: { 'application/jsonlines': { schema: okSchema() } } } },
      },
    },
    '/legacy-json': {
      get: {
        operationId: 'legacyJson',
        responses: { '200': { content: { 'application/json': { schema: okSchema() } } } },
      },
    },
    '/legacy-jsonl': {
      get: {
        operationId: 'legacyJsonl',
        responses: { '200': { content: { 'application/jsonl': { schema: okSchema() } } } },
      },
    },
  },
};

function okSchema() {
  return { type: 'object', properties: { ok: { type: 'boolean' } } };
}

function responseHandler(name: string): Obj {
  const schema = openAPIToVovkSchema({
    apiRoot: 'https://api.example.com',
    source: { object: responseSpec },
    getModuleName: () => 'Responses',
    getMethodName: ({ operationObject }: { operationObject: { operationId?: string } }) =>
      operationObject.operationId ?? 'op',
    segmentName: 'api',
  } as unknown as Parameters<typeof openAPIToVovkSchema>[0]) as Seg;
  return schema.segments.api.controllers.Responses.handlers[name];
}

const okProperties = { ok: { type: 'boolean' } };

describe('openAPIToVovkSchema — success response selection', () => {
  it('reads the 2XX wildcard status', () => {
    deepStrictEqual(responseHandler('wildcard').validation.output.properties, okProperties);
  });

  it('reads a +json structured suffix media type', () => {
    deepStrictEqual(responseHandler('vendor').validation.output.properties, okProperties);
  });

  it('ignores media type parameters', () => {
    deepStrictEqual(responseHandler('charset').validation.output.properties, okProperties);
  });

  it('reads a 2xx status other than 200 and 201', () => {
    deepStrictEqual(responseHandler('accepted').validation.output.properties, okProperties);
  });

  it('falls through a success status that carries no JSON body', () => {
    deepStrictEqual(responseHandler('fallthrough').validation.output.properties, okProperties);
  });

  it('prefers an exact application/json over a +json sibling', () => {
    deepStrictEqual(responseHandler('preferExact').validation.output.properties, okProperties);
  });

  it('never types the success path from `default`', () => {
    strictEqual(responseHandler('errorOnly').validation.output, undefined);
  });

  it('applies the same status handling to the iteration slot', () => {
    deepStrictEqual(responseHandler('streamWildcard').validation.iteration.properties, okProperties);
  });

  it('still reads a plain 200 application/json output', () => {
    deepStrictEqual(responseHandler('legacyJson').validation.output.properties, okProperties);
  });

  it('still reads a plain 200 application/jsonl iteration', () => {
    deepStrictEqual(responseHandler('legacyJsonl').validation.iteration.properties, okProperties);
  });
});
