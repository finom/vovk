import { deepStrictEqual, ok, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { procedure, type VovkSchema } from 'vovk';
import { type VovkStrictConfig, vovkSchemaToOpenAPI } from 'vovk/internal';
import { z } from 'zod';

// biome-ignore lint/suspicious/noExplicitAny: loose test alias for readable assertions
type Obj = Record<string, any>;
type Definition = Parameters<typeof procedure>[0];

const validationOf = (definition: Definition) =>
  JSON.parse(JSON.stringify(procedure(definition).handle(async () => null).schema.validation));

function toOpenAPI(
  handlers: Record<string, { path: string; httpMethod: string; definition?: Definition; validation?: Obj }>,
  { config, segmentName = null }: { config?: Obj; segmentName?: string | null } = {}
) {
  const schema = {
    $schema: 'https://vovk.dev/schema',
    segments: {
      '': {
        $schema: 'https://vovk.dev/segment',
        segmentName: '',
        emitSchema: true,
        segmentType: 'segment',
        controllers: {
          ThingRPC: {
            rpcModuleName: 'ThingRPC',
            prefix: 'things',
            handlers: Object.fromEntries(
              Object.entries(handlers).map(([name, { path, httpMethod, definition = {}, validation }]) => [
                name,
                {
                  path,
                  httpMethod,
                  operationObject: { summary: name },
                  validation: validation ?? validationOf(definition),
                },
              ])
            ),
          },
        },
      },
    },
  } as unknown as VovkSchema;
  return vovkSchemaToOpenAPI({
    config: config as VovkStrictConfig | undefined,
    schema,
    outputConfigs: [],
    isBundle: false,
    segmentName,
    projectPackageJson: undefined,
  }).openAPIObject as Obj;
}

// every $ref of the document must point at a schema inside it
function assertRefsResolve(document: Obj) {
  const refs: string[] = [];
  const collect = (value: unknown) => {
    if (Array.isArray(value)) value.forEach(collect);
    else if (value && typeof value === 'object') {
      for (const [key, item] of Object.entries(value)) {
        if (key === '$ref' && typeof item === 'string') refs.push(item);
        else collect(item);
      }
    }
  };
  collect(document);
  ok(refs.length > 0, 'expected the document to contain refs');
  for (const ref of refs) {
    ok(ref.startsWith('#/'), `${ref} is a local ref`);
    const target = ref
      .slice(2)
      .split('/')
      .reduce<Obj | undefined>((node, token) => node?.[decodeURIComponent(token)], document);
    ok(target && typeof target === 'object', `${ref} resolves`);
  }
  return refs;
}

const A = z.object({ kind: z.literal('a'), a: z.string() });
const B = z.object({ kind: z.literal('b'), b: z.number() });

const Tree: z.ZodType<{ value: number; children: unknown[] }> = z.object({
  value: z.number(),
  get children() {
    return z.array(Tree);
  },
});

const Folder: z.ZodType<{ name: string; folders: unknown[] }> = z.object({
  name: z.string(),
  get folders() {
    return z.array(Folder);
  },
});

describe('vovkSchemaToOpenAPI — schemas without a top-level type', () => {
  const openAPI = toOpenAPI({
    getUnion: { path: 'union', httpMethod: 'GET', definition: { output: z.discriminatedUnion('kind', [A, B]) } },
    getNullable: { path: 'nullable', httpMethod: 'GET', definition: { output: A.nullable() } },
    createUnion: { path: 'union', httpMethod: 'POST', definition: { body: z.union([A, B]) } },
    streamUnion: {
      path: 'stream',
      httpMethod: 'GET',
      definition: { iteration: z.union([A, B]) },
    },
  });

  it('Describes a union output', () => {
    const { schema } = openAPI.paths['/api/things/union'].get.responses[200].content['application/json'];
    strictEqual(schema.oneOf.length, 2);
  });

  it('Describes a nullable output', () => {
    const { schema } = openAPI.paths['/api/things/nullable'].get.responses[200].content['application/json'];
    deepStrictEqual(schema.anyOf[1], { type: 'null' });
  });

  it('Describes a union request body', () => {
    const { schema } = openAPI.paths['/api/things/union'].post.requestBody.content['application/json'];
    strictEqual(schema.anyOf.length, 2);
  });

  it('Describes a union JSON Lines item', () => {
    const { schema } = openAPI.paths['/api/things/stream'].get.responses[200].content['application/jsonl'];
    strictEqual(schema.anyOf.length, 2);
  });
});

describe('vovkSchemaToOpenAPI — component refs', () => {
  it('Turns a slot that refers to its own root into a component', () => {
    const openAPI = toOpenAPI({ saveTree: { path: 'tree', httpMethod: 'POST', definition: { body: Tree } } });
    const refs = assertRefsResolve(openAPI);
    ok(!refs.some((ref) => ref.endsWith('/#')), `no ref to a component named "#": ${refs}`);
    const { schema } = openAPI.paths['/api/things/tree'].post.requestBody.content['application/json'];
    const component = openAPI.components.schemas[schema.properties.children.items.$ref.split('/').pop()];
    deepStrictEqual(Object.keys(component.properties), ['value', 'children']);
  });

  it('Gives the numbered definitions of two handlers their own names', () => {
    const openAPI = toOpenAPI({
      saveTree: { path: 'tree', httpMethod: 'POST', definition: { body: z.object({ tree: Tree }) } },
      saveFolder: { path: 'folder', httpMethod: 'POST', definition: { body: z.object({ folder: Folder }) } },
    });
    assertRefsResolve(openAPI);
    const componentOf = (path: string, property: string) => {
      const { schema } = openAPI.paths[path].post.requestBody.content['application/json'];
      return openAPI.components.schemas[schema.properties[property].$ref.split('/').pop()];
    };
    deepStrictEqual(Object.keys(componentOf('/api/things/tree', 'tree').properties), ['value', 'children']);
    deepStrictEqual(Object.keys(componentOf('/api/things/folder', 'folder').properties), ['name', 'folders']);
    ok(!('__schema0' in openAPI.components.schemas), 'numbered names stay inside their slot');
  });

  it('Shares a named definition between handlers', () => {
    const User = z.object({ id: z.string(), name: z.string() }).meta({ id: 'OpenAPITestUser' });
    const openAPI = toOpenAPI({
      getUser: { path: '{id}', httpMethod: 'GET', definition: { output: z.object({ user: User }) } },
      listUsers: { path: '', httpMethod: 'GET', definition: { output: z.array(User) } },
    });
    assertRefsResolve(openAPI);
    deepStrictEqual(
      Object.keys(openAPI.components.schemas).filter((name) => name.includes('OpenAPITestUser')),
      ['OpenAPITestUser']
    );
  });

  it('Renames a named definition that another slot uses for a different schema, and the ones that refer to it', () => {
    // the same names from two libraries, or two versions of one schema
    const body = (itemProperty: string) => ({
      body: {
        type: 'object',
        properties: { wrapper: { $ref: '#/$defs/Wrapper' } },
        $defs: {
          Wrapper: { type: 'object', properties: { item: { $ref: '#/$defs/Item' } } },
          Item: { type: 'object', properties: { [itemProperty]: { type: 'string' } } },
        },
      },
    });
    const openAPI = toOpenAPI({
      createFirst: { path: 'first', httpMethod: 'POST', validation: body('a') },
      createSecond: { path: 'second', httpMethod: 'POST', validation: body('b') },
    });
    assertRefsResolve(openAPI);
    const itemOf = (path: string) => {
      const { schema } = openAPI.paths[path].post.requestBody.content['application/json'];
      const wrapper = openAPI.components.schemas[schema.properties.wrapper.$ref.split('/').pop()];
      return openAPI.components.schemas[wrapper.properties.item.$ref.split('/').pop()];
    };
    deepStrictEqual(Object.keys(itemOf('/api/things/first').properties), ['a']);
    deepStrictEqual(Object.keys(itemOf('/api/things/second').properties), ['b']);
  });

  it('Keeps a ref to a component of the document', () => {
    const openAPI = toOpenAPI({
      getStatus: {
        path: 'status',
        httpMethod: 'GET',
        validation: { output: { type: 'object', properties: { code: { $ref: '#/components/schemas/HttpStatus' } } } },
      },
    });
    const { schema } = openAPI.paths['/api/things/status'].get.responses[200].content['application/json'];
    strictEqual(schema.properties.code.$ref, '#/components/schemas/HttpStatus');
    assertRefsResolve(openAPI);
  });
});

describe('vovkSchemaToOpenAPI — paths', () => {
  const handlers = { getThing: { path: '{id}', httpMethod: 'GET', definition: {} } };

  it('Builds paths from the segment name by default', () => {
    deepStrictEqual(Object.keys(toOpenAPI(handlers).paths), ['/api/things/{id}']);
  });

  it('Uses segmentNameOverride and the segment rootEntry, as the generated client does', () => {
    const config = { outputConfig: { segments: { '': { segmentNameOverride: 'tenant', rootEntry: 'v2' } } } };
    deepStrictEqual(Object.keys(toOpenAPI(handlers, { config }).paths), ['/v2/tenant/things/{id}']);
    deepStrictEqual(Object.keys(toOpenAPI(handlers, { config, segmentName: '' }).paths), ['/v2/tenant/things/{id}']);
  });

  it('Drops the segment name when segmentNameOverride is empty', () => {
    const schema = (segmentName: string) => ({
      $schema: 'https://vovk.dev/schema',
      segments: {
        [segmentName]: {
          $schema: 'https://vovk.dev/segment',
          segmentName,
          emitSchema: true,
          segmentType: 'segment',
          controllers: {
            ThingRPC: {
              rpcModuleName: 'ThingRPC',
              prefix: 'things',
              handlers: { getThing: { path: '{id}', httpMethod: 'GET', operationObject: {} } },
            },
          },
        },
      },
    });
    const { openAPIObject } = vovkSchemaToOpenAPI({
      config: { outputConfig: { segments: { admin: { segmentNameOverride: '' } } } } as unknown as VovkStrictConfig,
      schema: schema('admin') as unknown as VovkSchema,
      outputConfigs: [],
      isBundle: false,
      segmentName: 'admin',
      projectPackageJson: undefined,
    });
    deepStrictEqual(Object.keys(openAPIObject.paths ?? {}), ['/api/things/{id}']);
  });
});

describe('vovkSchemaToOpenAPI — parameters', () => {
  const parametersOf = (validation: Obj, path = '{id}') =>
    toOpenAPI({ getThing: { path, httpMethod: 'GET', validation } }).paths[`/api/things/${path}`].get
      .parameters as Obj[];

  it('Requires a path parameter the params schema leaves optional', () => {
    const parameters = parametersOf({ params: { type: 'object', properties: { id: { type: 'string' } } } });
    deepStrictEqual(parameters, [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }]);
  });

  it('Declares a path parameter that no params schema describes', () => {
    deepStrictEqual(parametersOf({}, '{id}/items/{itemId}'), [
      { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
      { name: 'itemId', in: 'path', required: true, schema: { type: 'string' } },
    ]);
  });

  it('Lists the parameters of a query or params schema that refers to a component', () => {
    const parameters = parametersOf({
      query: {
        $ref: '#/$defs/ListQuery',
        $defs: {
          ListQuery: { type: 'object', properties: { page: { type: 'number' } }, required: ['page'] },
        },
      },
      params: {
        $ref: '#/$defs/ItemParams',
        $defs: { ItemParams: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
      },
    });
    deepStrictEqual(
      parameters.map(({ name, in: location, required }) => ({ name, in: location, required })),
      [
        { name: 'page', in: 'query', required: true },
        { name: 'id', in: 'path', required: true },
      ]
    );
  });

  it('Sends an object query parameter as deepObject, the way the server reads it', () => {
    const parameters = parametersOf(
      {
        query: {
          type: 'object',
          properties: {
            filter: { type: 'object', properties: { status: { type: 'string' } } },
            maybe: { anyOf: [{ type: 'object', properties: { a: { type: 'string' } } }, { type: 'null' }] },
            tags: { type: 'array', items: { type: 'string' } },
            page: { type: 'integer' },
          },
        },
      },
      'list'
    );
    deepStrictEqual(
      parameters.map(({ name, style, explode }) => ({ name, style, explode })),
      [
        { name: 'filter', style: 'deepObject', explode: true },
        { name: 'maybe', style: 'deepObject', explode: true },
        { name: 'tags', style: undefined, explode: undefined },
        { name: 'page', style: undefined, explode: undefined },
      ]
    );
  });
});

describe('vovkSchemaToOpenAPI — component names', () => {
  it('Gives a component a name OpenAPI accepts', () => {
    const openAPI = toOpenAPI({
      createUser: {
        path: '',
        httpMethod: 'POST',
        validation: {
          body: {
            type: 'object',
            properties: { profile: { $ref: '#/$defs/User Profile' }, tag: { $ref: '#/$defs/api~1v1.Tag' } },
            $defs: { 'User Profile': { type: 'object' }, 'api/v1.Tag': { type: 'string' } },
          },
        },
      },
    });
    assertRefsResolve(openAPI);
    for (const name of Object.keys(openAPI.components.schemas)) ok(/^[a-zA-Z0-9.\-_]+$/.test(name), name);
    const { schema } = openAPI.paths['/api/things'].post.requestBody.content['application/json'];
    deepStrictEqual(schema.properties, {
      profile: { $ref: '#/components/schemas/User_Profile' },
      tag: { $ref: '#/components/schemas/api_v1.Tag' },
    });
  });

  it('Keeps a schema the config declares and names the derived one of the same name apart', () => {
    const declaredUser = { type: 'object', properties: { legacy: { type: 'boolean' } } };
    const openAPI = toOpenAPI(
      {
        createUser: {
          path: '',
          httpMethod: 'POST',
          validation: {
            body: {
              type: 'object',
              properties: { user: { $ref: '#/$defs/User' } },
              $defs: { User: { type: 'object', properties: { name: { type: 'string' } } } },
            },
          },
        },
      },
      { config: { outputConfig: { openAPIObject: { components: { schemas: { User: declaredUser } } } } } }
    );
    assertRefsResolve(openAPI);
    deepStrictEqual(openAPI.components.schemas.User, declaredUser);
    const { schema } = openAPI.paths['/api/things'].post.requestBody.content['application/json'];
    const derived = openAPI.components.schemas[schema.properties.user.$ref.split('/').pop()];
    deepStrictEqual(derived, { type: 'object', properties: { name: { type: 'string' } } });
  });
});

describe('vovkSchemaToOpenAPI — JSON Lines', () => {
  it('Gives a JSON Lines response an example of three lines and leaves the item schema as it is', () => {
    const item = { type: 'object', properties: { n: { type: 'number' } }, required: ['n'] };
    const openAPI = toOpenAPI({ stream: { path: 'stream', httpMethod: 'GET', validation: { iteration: item } } });
    const media = openAPI.paths['/api/things/stream'].get.responses[200].content['application/jsonl'];
    deepStrictEqual(media.schema, item);
    deepStrictEqual(
      media.example.split('\n').map((line: string) => JSON.parse(line)),
      [{ n: 0 }, { n: 0 }, { n: 0 }]
    );
  });

  it('Gives an item schema that uses $defs an example of its definitions', () => {
    const task = {
      type: 'object',
      properties: { id: { type: 'string' }, done: { type: 'boolean' } },
      required: ['id', 'done'],
    };
    const item = { $ref: '#/$defs/Task', $defs: { Task: task } };
    const openAPI = toOpenAPI({ stream: { path: 'stream', httpMethod: 'GET', validation: { iteration: item } } });
    const media = openAPI.paths['/api/things/stream'].get.responses[200].content['application/jsonl'];
    deepStrictEqual(
      media.example.split('\n').map((line: string) => JSON.parse(line)),
      Array(3).fill({ id: 'string', done: true })
    );
  });

  it('Keeps the example small when the item nests arrays with minItems', () => {
    let item: Obj = { type: 'string' };
    for (let i = 0; i < 10; i++) item = { type: 'array', minItems: 3, items: item };
    const openAPI = toOpenAPI({ stream: { path: 'stream', httpMethod: 'GET', validation: { iteration: item } } });
    const media = openAPI.paths['/api/things/stream'].get.responses[200].content['application/jsonl'];
    // 3 items per level would make 3^10 strings in every line
    ok(media.example.length < JSON.stringify(item).length * 50, `a ${media.example.length}-char example`);
    deepStrictEqual(media.example.split('\n').length, 3);
  });
});
