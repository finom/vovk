import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import type { VovkJSONSchemaBase } from 'vovk';
import {
  areFilesOptional,
  convertJSONSchemaToPythonDataType,
  convertJSONSchemaToPythonFilesType,
  getBodyKind,
  hasFiles,
  hasNormalData,
  toPythonCommentText,
  toPythonDocstringLines,
  toPythonIdentifier,
  toPythonString,
} from '../index.js';

test('convertJSONSchemaToPythonDataType - simple types', async (t) => {
  await t.test('converts string schema', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: { type: 'string' },
      namespace: 'MyNamespace',
      className: 'MyString',
      pad: 0,
    });

    assert.equal(result, 'MyString: TypeAlias = str');
  });

  await t.test('converts integer schema', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: { type: 'integer' },
      namespace: 'MyNamespace',
      className: 'MyInteger',
      pad: 0,
    });

    assert.equal(result, 'MyInteger: TypeAlias = int');
  });

  await t.test('converts number schema', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: { type: 'number' },
      namespace: 'MyNamespace',
      className: 'MyNumber',
      pad: 0,
    });

    assert.equal(result, 'MyNumber: TypeAlias = float');
  });

  await t.test('converts boolean schema', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: { type: 'boolean' },
      namespace: 'MyNamespace',
      className: 'MyBoolean',
      pad: 0,
    });

    assert.equal(result, 'MyBoolean: TypeAlias = bool');
  });

  await t.test('converts null schema', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: { type: 'null' },
      namespace: 'MyNamespace',
      className: 'MyNull',
      pad: 0,
    });

    assert.equal(result, 'MyNull: TypeAlias = None');
  });
});

test('convertJSONSchemaToPythonDataType - array types', async (t) => {
  await t.test('converts array of strings', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: {
        type: 'array',
        items: { type: 'string' },
      },
      namespace: 'MyNamespace',
      className: 'StringArray',
      pad: 0,
    });

    assert.equal(result, 'StringArray: TypeAlias = List[str]');
  });

  await t.test('converts array of any type', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: {
        type: 'array',
      },
      namespace: 'MyNamespace',
      className: 'AnyArray',
      pad: 0,
    });

    assert.equal(result, 'AnyArray: TypeAlias = List[Any]');
  });

  await t.test('converts tuple type', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: {
        type: 'array',
        // @ts-expect-error Weird
        items: [{ type: 'string' }, { type: 'integer' }, { type: 'boolean' }],
      },
      namespace: 'MyNamespace',
      className: 'MyTuple',
      pad: 0,
    });

    assert.equal(result, 'MyTuple: TypeAlias = Tuple[str, int, bool]');
  });

  await t.test('converts a 2020-12 tuple, as zod writes it', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: { type: 'array', prefixItems: [{ type: 'string' }, { type: 'number' }] },
      namespace: 'MyNamespace',
      className: 'MyTuple',
      pad: 0,
    });

    assert.equal(result, 'MyTuple: TypeAlias = Tuple[str, float]');
  });

  await t.test('converts a tuple with more items after its own to a list', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: { type: 'array', prefixItems: [{ type: 'string' }], items: { type: 'number' } },
      namespace: 'MyNamespace',
      className: 'MyTuple',
      pad: 0,
    });

    assert.equal(result, 'MyTuple: TypeAlias = List[Union[str, float]]');
  });
});

test('convertJSONSchemaToPythonDataType - enum types', async (t) => {
  await t.test('converts string enum', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: {
        type: 'string',
        enum: ['one', 'two', 'three'],
      },
      namespace: 'MyNamespace',
      className: 'StringEnum',
      pad: 0,
    });

    assert.equal(result, 'StringEnum: TypeAlias = Literal["one", "two", "three"]');
  });

  await t.test('converts numeric enum', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: {
        type: 'integer',
        enum: [1, 2, 3],
      },
      namespace: 'MyNamespace',
      className: 'NumericEnum',
      pad: 0,
    });

    assert.equal(result, 'NumericEnum: TypeAlias = Literal[1, 2, 3]');
  });
});

test('convertJSONSchemaToPythonDataType - union types', async (t) => {
  await t.test('converts union of primitive types', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: {
        type: ['string', 'null'],
      },
      namespace: 'MyNamespace',
      className: 'OptionalString',
      pad: 0,
    });

    assert.equal(result, 'OptionalString: TypeAlias = Union[str, None]');
  });

  await t.test('converts union with oneOf', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: {
        oneOf: [{ type: 'string' }, { type: 'integer' }],
      },
      namespace: 'MyNamespace',
      className: 'StringOrInt',
      pad: 0,
    });

    assert.equal(result, 'StringOrInt: TypeAlias = Union[str, int]');
  });

  await t.test('converts union with anyOf', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: {
        anyOf: [{ type: 'string' }, { type: 'integer' }, { type: 'boolean' }],
      },
      namespace: 'MyNamespace',
      className: 'MixedTypes',
      pad: 0,
    });

    assert.equal(result, 'MixedTypes: TypeAlias = Union[str, int, bool]');
  });
});

test('convertJSONSchemaToPythonDataType - simple objects', async (t) => {
  await t.test('converts simple object', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'integer' },
        },
        required: ['name'],
      },
      namespace: 'MyNamespace',
      className: 'Person',
      pad: 0,
    });

    const expected = `class Person(TypedDict):
    name: str
    age: NotRequired[int]`;

    assert.equal(result, expected);
  });

  await t.test('converts empty object', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: {
        type: 'object',
        properties: {},
      },
      namespace: 'MyNamespace',
      className: 'EmptyObject',
      pad: 0,
    });

    const expected = `class EmptyObject(TypedDict):
    pass`;

    assert.equal(result, expected);
  });
});

test('convertJSONSchemaToPythonDataType - complex objects', async (t) => {
  await t.test('converts nested objects', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
              zipCode: { type: 'string' },
            },
            required: ['street', 'city'],
          },
        },
        required: ['name', 'address'],
      },
      namespace: 'MyNamespace',
      className: 'Person',
      pad: 0,
    });

    const expected = `class _Person_address(TypedDict):
    street: str
    city: str
    zipCode: NotRequired[str]
class Person(TypedDict):
    name: str
    address: MyNamespace._Person_address`;

    assert.equal(result, expected);
  });

  await t.test('converts object with arrays', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          tags: {
            type: 'array',
            items: { type: 'string' },
          },
          friends: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                age: { type: 'integer' },
              },
              required: ['name'],
            },
          },
        },
        required: ['name'],
      },
      namespace: 'MyNamespace',
      className: 'Person',
      pad: 0,
    });

    const expected = `class _Person_friends_items(TypedDict):
    name: str
    age: NotRequired[int]
class Person(TypedDict):
    name: str
    tags: NotRequired[List[str]]
    friends: NotRequired[List[MyNamespace._Person_friends_items]]`;

    assert.equal(result, expected);
  });
});

test('convertJSONSchemaToPythonDataType - allOf', async (t) => {
  await t.test('converts allOf with merged properties', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: {
        allOf: [
          {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
            },
            required: ['name'],
          },
          {
            type: 'object',
            properties: {
              age: { type: 'integer' },
              phone: { type: 'string' },
            },
            required: ['phone'],
          },
        ],
      },
      namespace: 'MyNamespace',
      className: 'Contact',
      pad: 0,
    });

    const expected = `class Contact(TypedDict):
    name: str
    email: NotRequired[str]
    age: NotRequired[int]
    phone: str`;

    assert.equal(result, expected);
  });
});

test('convertJSONSchemaToPythonDataType - complex nesting', async (t) => {
  await t.test('converts deeply nested structure', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              profile: {
                type: 'object',
                properties: {
                  personal: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      age: { type: 'integer' },
                    },
                    required: ['name'],
                  },
                  preferences: {
                    type: 'object',
                    properties: {
                      theme: { type: 'string', enum: ['light', 'dark'] },
                      notifications: { type: 'boolean' },
                    },
                  },
                },
              },
              posts: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    content: { type: 'string' },
                    tags: {
                      type: 'array',
                      items: { type: 'string' },
                    },
                  },
                  required: ['title', 'content'],
                },
              },
            },
          },
        },
      },
      namespace: 'API',
      className: 'Response',
      pad: 2,
    });

    const expected = `  class _Response_user_profile_personal(TypedDict):
      name: str
      age: NotRequired[int]
  class _Response_user_profile_preferences(TypedDict):
      theme: NotRequired[Literal["light", "dark"]]
      notifications: NotRequired[bool]
  class _Response_user_profile(TypedDict):
      personal: NotRequired[API._Response_user_profile_personal]
      preferences: NotRequired[API._Response_user_profile_preferences]
  class _Response_user_posts_items(TypedDict):
      title: str
      content: str
      tags: NotRequired[List[str]]
  class _Response_user(TypedDict):
      profile: NotRequired[API._Response_user_profile]
      posts: NotRequired[List[API._Response_user_posts_items]]
  class Response(TypedDict):
      user: NotRequired[API._Response_user]`;

    assert.equal(result, expected);
  });
});

test('convertJSONSchemaToPythonDataType - error handling', async (t) => {
  await t.test('handles empty schema', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: {},
      namespace: 'MyNamespace',
      className: 'EmptySchema',
      pad: 0,
    });

    assert.equal(result, 'EmptySchema: TypeAlias = Any');
  });

  await t.test('handles null schema', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: null as unknown as VovkJSONSchemaBase,
      namespace: 'MyNamespace',
      className: 'NullSchema',
      pad: 0,
    });

    assert.equal(result, '');
  });
});

test('convertJSONSchemaToPythonDataType - padding', async (t) => {
  await t.test('applies padding correctly', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'integer' },
        },
      },
      namespace: 'MyNamespace',
      className: 'Person',
      pad: 4,
    });

    const expected = `    class Person(TypedDict):
        name: NotRequired[str]
        age: NotRequired[int]`;

    assert.equal(result, expected);
  });
});

test('convertJSONSchemaToPythonDataType - real-world examples', async (t) => {
  await t.test('converts API response schema', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['success', 'error'] },
          code: { type: 'integer' },
          data: {
            type: 'object',
            properties: {
              users: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string' },
                    role: { type: 'string', enum: ['admin', 'user', 'guest'] },
                    meta: { type: 'object' },
                  },
                  required: ['id', 'name', 'email'],
                },
              },
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'integer' },
                  totalPages: { type: 'integer' },
                  nextPage: { type: ['integer', 'null'] },
                  prevPage: { type: ['integer', 'null'] },
                },
                required: ['page', 'totalPages'],
              },
            },
            required: ['users'],
          },
          error: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              details: { type: 'array', items: { type: 'string' } },
            },
            required: ['message'],
          },
        },
        required: ['status', 'code'],
      },
      namespace: 'API',
      className: 'Response',
      pad: 0,
    });

    const expected = `class _Response_data_users_items_meta(TypedDict):
    pass
class _Response_data_users_items(TypedDict):
    id: str
    name: str
    email: str
    role: NotRequired[Literal["admin", "user", "guest"]]
    meta: NotRequired[API._Response_data_users_items_meta]
class _Response_data_pagination(TypedDict):
    page: int
    totalPages: int
    nextPage: NotRequired[Union[int, None]]
    prevPage: NotRequired[Union[int, None]]
class _Response_data(TypedDict):
    users: List[API._Response_data_users_items]
    pagination: NotRequired[API._Response_data_pagination]
class _Response_error(TypedDict):
    message: str
    details: NotRequired[List[str]]
class Response(TypedDict):
    status: Literal["success", "error"]
    code: int
    data: NotRequired[API._Response_data]
    error: NotRequired[API._Response_error]`;

    assert.equal(result, expected);
  });

  await t.test('converts config schema with advanced features', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: {
        type: 'object',
        properties: {
          serverConfig: {
            type: 'object',
            properties: {
              host: { type: 'string' },
              port: { type: 'integer' },
              ssl: { type: 'boolean' },
              corsOptions: {
                anyOf: [
                  { type: 'boolean' },
                  {
                    type: 'object',
                    properties: {
                      origin: {
                        oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
                      },
                      methods: { type: 'array', items: { type: 'string' } },
                      allowHeaders: { type: 'array', items: { type: 'string' } },
                    },
                  },
                ],
              },
            },
            required: ['host', 'port'],
          },
          database: {
            allOf: [
              {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['mysql', 'postgres', 'mongodb'] },
                  name: { type: 'string' },
                },
                required: ['type', 'name'],
              },
              {
                type: 'object',
                properties: {
                  credentials: {
                    type: 'object',
                    properties: {
                      user: { type: 'string' },
                      password: { type: 'string' },
                      host: { type: 'string' },
                      port: { type: 'integer' },
                    },
                    required: ['user', 'password', 'host'],
                  },
                },
                required: ['credentials'],
              },
            ],
          },
          features: {
            type: 'object',
            properties: {
              auth: {
                type: 'object',
                properties: {
                  enabled: { type: 'boolean' },
                  providers: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        config: { type: 'object' },
                      },
                      required: ['name'],
                    },
                  },
                },
              },
              caching: {
                type: 'object',
                properties: {
                  strategy: { type: 'string', enum: ['memory', 'redis'] },
                  ttl: { type: 'integer' },
                },
              },
            },
          },
        },
        required: ['serverConfig', 'database'],
      },
      namespace: 'Config',
      className: 'AppConfig',
      pad: 0,
    });

    const expected = `class _AppConfig_serverConfig_corsOptions_anyOf_1(TypedDict):
    origin: NotRequired[Union[str, List[str]]]
    methods: NotRequired[List[str]]
    allowHeaders: NotRequired[List[str]]
class _AppConfig_serverConfig(TypedDict):
    host: str
    port: int
    ssl: NotRequired[bool]
    corsOptions: NotRequired[Union[bool, Config._AppConfig_serverConfig_corsOptions_anyOf_1]]
class _AppConfig_database_credentials(TypedDict):
    user: str
    password: str
    host: str
    port: NotRequired[int]
class _AppConfig_database(TypedDict):
    type: Literal["mysql", "postgres", "mongodb"]
    name: str
    credentials: Config._AppConfig_database_credentials
class _AppConfig_features_auth_providers_items_config(TypedDict):
    pass
class _AppConfig_features_auth_providers_items(TypedDict):
    name: str
    config: NotRequired[Config._AppConfig_features_auth_providers_items_config]
class _AppConfig_features_auth(TypedDict):
    enabled: NotRequired[bool]
    providers: NotRequired[List[Config._AppConfig_features_auth_providers_items]]
class _AppConfig_features_caching(TypedDict):
    strategy: NotRequired[Literal["memory", "redis"]]
    ttl: NotRequired[int]
class _AppConfig_features(TypedDict):
    auth: NotRequired[Config._AppConfig_features_auth]
    caching: NotRequired[Config._AppConfig_features_caching]
class AppConfig(TypedDict):
    serverConfig: Config._AppConfig_serverConfig
    database: Config._AppConfig_database
    features: NotRequired[Config._AppConfig_features]`;

    assert.equal(result, expected);
  });

  await t.test('converts schema with special format fields', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          email: { type: 'string', format: 'email' },
          website: { type: 'string', format: 'uri' },
          ipAddress: { type: 'string', format: 'ipv4' },
        },
        required: ['id', 'createdAt', 'email'],
      },
      namespace: 'API',
      className: 'UserRecord',
      pad: 0,
    });

    const expected = `class UserRecord(TypedDict):
    id: str
    createdAt: str
    updatedAt: NotRequired[str]
    email: str
    website: NotRequired[str]
    ipAddress: NotRequired[str]`;

    assert.equal(result, expected);
  });
});

test('convertJSONSchemaToPythonDataType - $refs', async (t) => {
  await t.test('resolves named refs and terminates on cycles', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: {
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
          Post: { type: 'object', properties: { title: { type: 'string' } } },
        },
      },
      namespace: 'Rpc',
      className: 'Body',
      pad: 0,
    });

    assert.ok(result.includes('class _Body_User(TypedDict):'), result);
    assert.ok(result.includes('friend: NotRequired[Rpc._Body_User]'), result);
    assert.ok(result.includes('posts: NotRequired[List[Rpc._Body_Post]]'), result);
    assert.ok(result.includes('user: Rpc._Body_User'), result);
    // the class name must not be mangled by Python's double underscore rule
    assert.ok(!result.includes('class __Body_User'), result);
  });

  await t.test('aliases non object definitions', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: {
        type: 'object',
        properties: { kind: { $ref: '#/$defs/Kind' } },
        required: ['kind'],
        $defs: { Kind: { type: 'string', enum: ['a', 'b'] } },
      },
      namespace: 'Rpc',
      className: 'Body',
      pad: 0,
    });

    assert.ok(result.includes('_Body_Kind: TypeAlias = Literal["a", "b"]'), result);
    assert.ok(result.includes('kind: Rpc._Body_Kind'), result);
  });

  await t.test('unknown refs fall back to Any', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: { type: 'object', properties: { x: { $ref: '#/$defs/Missing' } }, required: ['x'] },
      namespace: 'Rpc',
      className: 'Body',
      pad: 0,
    });

    assert.ok(result.includes('x: Any'), result);
  });

  await t.test('turns ref names into valid python identifiers', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: {
        type: 'object',
        properties: { ts: { $ref: '#/$defs/google.protobuf.Timestamp' }, u: { $ref: '#/$defs/user-profile' } },
        required: ['ts', 'u'],
        $defs: {
          'google.protobuf.Timestamp': { type: 'object', properties: { seconds: { type: 'number' } } },
          'user-profile': { type: 'string', enum: ['a', 'b'] },
        },
      },
      namespace: 'Rpc',
      className: 'Body',
      pad: 0,
    });

    assert.ok(!result.includes('.protobuf.') && !result.includes('user-profile'), result);
    assert.ok(result.includes('class _Body_google_protobuf_Timestamp(TypedDict):'), result);
    assert.ok(result.includes('ts: Rpc._Body_google_protobuf_Timestamp'), result);
    assert.ok(result.includes('_Body_user_profile: TypeAlias = Literal["a", "b"]'), result);
  });
});

test('getBodyKind', async (t) => {
  await t.test('classifies content types', () => {
    assert.equal(getBodyKind(undefined), 'none');
    assert.equal(getBodyKind({ type: 'string', 'x-contentType': ['text/plain'] }), 'text');
    assert.equal(getBodyKind({ type: 'string', 'x-contentType': ['application/octet-stream'] }), 'binary');
    assert.equal(getBodyKind({ type: 'string', 'x-contentType': ['image/png'] }), 'binary');
    assert.equal(getBodyKind({ type: 'string', format: 'binary' }), 'binary');
    assert.equal(getBodyKind({ type: 'object', 'x-contentType': ['multipart/form-data'] }), 'form');
    assert.equal(getBodyKind({ type: 'object', 'x-contentType': ['application/json'] }), 'json');
    assert.equal(getBodyKind({ type: 'object', properties: {} }), 'json');
  });

  await t.test('an object goes out as JSON, whatever text type the procedure also takes', () => {
    const body = { type: 'object', properties: { event: { type: 'string' } } } as const;

    assert.equal(getBodyKind({ ...body, 'x-contentType': ['text/plain', 'application/json'] }), 'json');
    assert.equal(getBodyKind({ ...body, 'x-contentType': ['application/json', 'text/plain'] }), 'json');
  });

  await t.test('reads a body that only declares its content type', () => {
    // a procedure with contentType and no body schema
    assert.equal(getBodyKind({ 'x-contentType': ['text/plain'] }), 'text');
    assert.equal(getBodyKind({ 'x-contentType': ['application/octet-stream'] }), 'binary');
    assert.equal(getBodyKind({ 'x-contentType': ['multipart/form-data'] }), 'form');
    assert.equal(hasNormalData({ 'x-contentType': ['multipart/form-data'] }), true);
    assert.equal(
      convertJSONSchemaToPythonDataType({
        schema: { 'x-contentType': ['application/json'] },
        namespace: 'Rpc',
        className: 'Body',
        pad: 0,
      }),
      'Body: TypeAlias = Any'
    );
  });
});

test('schema text never leaves its literal', async (t) => {
  const breakout = 'A thing"""\n__import__("os").system("id")\n"""';

  await t.test('escapes titles and descriptions in docstrings', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: { type: 'object', title: 'C:\\Users', description: breakout, properties: { a: { type: 'string' } } },
      namespace: 'Rpc',
      className: 'Body',
      pad: 0,
    });

    assert.ok(result.includes('    C:\\\\Users'), result);
    assert.ok(result.includes('    A thing\\"\\"\\"'), result);
    assert.equal(result.match(/"""/g)?.length, 2, result);
  });

  await t.test('declares keys that are not plain names with the functional syntax', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: {
        type: 'object',
        properties: {
          from: { type: 'string' },
          'content-type': { type: 'string' },
          'x\nimport os': { type: 'string' },
        },
        required: ['from'],
      },
      namespace: 'Rpc',
      className: 'Body',
      pad: 0,
    });

    assert.equal(
      result,
      'Body = TypedDict("Body", {"from": "str", "content-type": "NotRequired[str]", "x\\nimport os": "NotRequired[str]"})'
    );
  });

  await t.test('writes enum values as Python literals', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: { enum: ['say "hi"', true, null, 1.5, { no: 'object' }] },
      namespace: 'Rpc',
      className: 'Kind',
      pad: 0,
    });

    assert.equal(result, 'Kind: TypeAlias = Literal["say \\"hi\\"", True, None, 1.5]');
  });

  await t.test('names the helpers for templates', () => {
    assert.equal(toPythonIdentifier('from'), 'from_');
    assert.equal(toPythonIdentifier('user-profiles'), 'user_profiles');
    assert.equal(toPythonIdentifier('2fa'), '_2fa');
    assert.equal(toPythonString('it\'s "x"\n'), '"it\'s \\"x\\"\\n"');
    assert.deepEqual(toPythonDocstringLines('a"""\r\nb\\\u0000'), ['a\\"\\"\\"', 'b\\\\\\x00']);
    assert.equal(toPythonCommentText('a\nimport os\r\nb'), 'a import os b');
  });
});

test('allOf and $ref bodies', async (t) => {
  await t.test('merges referenced members and sibling properties', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: {
        allOf: [{ $ref: '#/$defs/Base' }, { type: 'object', properties: { extra: { type: 'string' } } }],
        properties: { own: { type: 'boolean' } },
        $defs: { Base: { type: 'object', properties: { id: { type: 'integer' } }, required: ['id'] } },
      },
      namespace: 'Rpc',
      className: 'Output',
      pad: 0,
    });

    assert.ok(result.includes('    id: int'), result);
    assert.ok(result.includes('    extra: NotRequired[str]'), result);
    assert.ok(result.includes('    own: NotRequired[bool]'), result);
  });

  await t.test('looks through a bare $ref body for its fields', () => {
    const body: VovkJSONSchemaBase = {
      $ref: '#/$defs/Upload',
      $defs: {
        Upload: {
          type: 'object',
          properties: { name: { type: 'string' }, file: { type: 'string', format: 'binary' } },
          required: ['file'],
        },
      },
    };

    assert.equal(hasNormalData(body), true);
    assert.equal(hasFiles(body), true);
    assert.ok(
      convertJSONSchemaToPythonFilesType({ schema: body, namespace: 'Rpc', className: 'Files', pad: 0 }).includes(
        'class Files(TypedDict):'
      )
    );
  });
});

test('files in a union branch, behind a $ref or in a list', async (t) => {
  const file = { type: 'string', format: 'binary' } as const;
  // as z.union([z.object({ n: z.number() }), z.object({ file: z.file() })]) emits it
  const fileOrJSON: VovkJSONSchemaBase = {
    anyOf: [
      { type: 'object', properties: { n: { type: 'number' } }, required: ['n'] },
      { type: 'object', properties: { file }, required: ['file'] },
    ],
    'x-contentType': ['application/json', 'multipart/form-data'],
  };
  const upload: VovkJSONSchemaBase = { type: 'object', properties: { file }, required: ['file'] };

  await t.test('are found as the Rust client finds them', () => {
    assert.equal(hasFiles(fileOrJSON), true);
    assert.equal(hasFiles({ type: 'object', properties: { files: { type: 'array', items: file } } }), true);
    assert.equal(
      hasFiles({ type: 'object', properties: { file: { $ref: '#/$defs/File' } }, $defs: { File: file } }),
      true
    );
    assert.equal(hasFiles({ type: 'object', properties: { file: { anyOf: [file, { type: 'null' }] } } }), true);
    assert.equal(
      hasFiles({ type: 'object', properties: { file: { type: 'string', contentEncoding: 'binary' } } }),
      true
    );
    assert.equal(hasFiles({ allOf: [{ $ref: '#/$defs/Upload' }], $defs: { Upload: upload } }), true);
    assert.equal(
      hasFiles({ anyOf: [{ type: 'object', properties: { n: { type: 'number' } } }, { type: 'string' }] }),
      false
    );
  });

  await t.test('may be left out when a branch holds none', () => {
    assert.equal(areFilesOptional(fileOrJSON), true);
    assert.equal(areFilesOptional(upload), false);
    assert.equal(
      areFilesOptional({ allOf: [upload, { type: 'object', properties: { n: { type: 'number' } } }] }),
      false
    );
  });

  await t.test('make a files type of the fields of every branch', () => {
    const result = convertJSONSchemaToPythonFilesType({
      schema: fileOrJSON,
      namespace: 'Rpc',
      className: 'Files',
      pad: 0,
    });

    assert.ok(result.includes('class Files(TypedDict):'), result);
    assert.match(result, /^ {4}file: Union\[BinaryIO/m);
  });
});

test('bodies without top-level properties', async (t) => {
  await t.test('may carry data', () => {
    assert.equal(hasNormalData({ type: 'array', items: { type: 'string' } }), true);
    assert.equal(
      hasNormalData({ anyOf: [{ type: 'object', properties: { a: { type: 'string' } } }, { type: 'string' }] }),
      true
    );
    assert.equal(hasNormalData({ type: 'object', additionalProperties: { type: 'string' } }), true);
    assert.equal(hasNormalData({ type: 'object', properties: { file: { type: 'string', format: 'binary' } } }), false);
  });

  await t.test('a record is a Dict of its values', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: { type: 'object', additionalProperties: { type: 'number' } },
      namespace: 'Rpc',
      className: 'Body',
      pad: 0,
    });

    assert.equal(result, 'Body: TypeAlias = Dict[str, float]');
  });

  await t.test('a record of any values is a Dict of Any', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: {
        type: 'object',
        properties: {
          // as Zod emits z.record(z.string(), z.unknown())
          meta: { type: 'object', propertyNames: { type: 'string' }, additionalProperties: {} } as VovkJSONSchemaBase,
        },
        required: ['meta'],
      },
      namespace: 'Rpc',
      className: 'Body',
      pad: 0,
    });

    assert.equal(result, 'class Body(TypedDict):\n    meta: Dict[str, Any]');
  });
});

test('recursive definitions', async (t) => {
  await t.test('an alias that refers to itself has Any there', () => {
    // as Zod emits z.json()
    const result = convertJSONSchemaToPythonDataType({
      schema: {
        type: 'object',
        properties: { data: { $ref: '#/$defs/__schema0' } },
        required: ['data'],
        $defs: {
          __schema0: {
            anyOf: [
              { type: 'string' },
              { type: 'number' },
              { type: 'boolean' },
              { type: 'null' },
              { type: 'array', items: { $ref: '#/$defs/__schema0' } },
              { type: 'object', additionalProperties: { $ref: '#/$defs/__schema0' } },
            ],
          },
        },
      },
      namespace: 'Rpc',
      className: 'Body',
      pad: 0,
    });

    assert.equal(
      result,
      `_Body___schema0: TypeAlias = Union[str, float, bool, None, List[Any], Dict[str, Any]]
class Body(TypedDict):
    data: Rpc._Body___schema0`
    );
  });

  await t.test('an alias has Any for a class that is still being built', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: {
        type: 'object',
        properties: { tree: { $ref: '#/$defs/Tree' } },
        required: ['tree'],
        $defs: {
          Tree: { type: 'object', properties: { children: { $ref: '#/$defs/Forest' } }, required: ['children'] },
          Forest: { type: 'array', items: { $ref: '#/$defs/Tree' } },
        },
      },
      namespace: 'Rpc',
      className: 'Body',
      pad: 0,
    });

    assert.equal(
      result,
      `_Body_Forest: TypeAlias = List[Any]
class _Body_Tree(TypedDict):
    children: Rpc._Body_Forest
class Body(TypedDict):
    tree: Rpc._Body_Tree`
    );
  });

  await t.test('a class may name itself', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: {
        $ref: '#/$defs/Node',
        $defs: {
          Node: {
            type: 'object',
            properties: { next: { anyOf: [{ $ref: '#/$defs/Node' }, { type: 'null' }] } },
            required: ['next'],
          },
        },
      },
      namespace: 'Rpc',
      className: 'Body',
      pad: 0,
    });

    assert.equal(
      result,
      `class _Body_Node(TypedDict):
    next: Union[Rpc._Body_Node, None]
Body: TypeAlias = _Body_Node`
    );
  });
});

test('names Python resolves', async (t) => {
  await t.test('a nested class has one leading underscore, so Python does not mangle it', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: {
        type: 'object',
        properties: { a: { type: 'object', properties: { b: { type: 'string' } } } },
        required: ['a'],
      },
      namespace: 'Rpc',
      className: 'Body',
      pad: 0,
    });

    assert.equal(
      result,
      `class _Body_a(TypedDict):
    b: NotRequired[str]
class Body(TypedDict):
    a: Rpc._Body_a`
    );
  });

  await t.test('the functional syntax names a nested class in full', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: { type: 'object', properties: { 'a-b': { type: 'object', properties: {} } }, required: ['a-b'] },
      namespace: 'Rpc',
      className: 'Body',
      pad: 0,
    });

    assert.equal(result, 'class _Body_a_b(TypedDict):\n    pass\nBody = TypedDict("Body", {"a-b": "Rpc._Body_a_b"})');
  });

  await t.test('a nested class and a definition do not share a name', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: {
        type: 'object',
        properties: {
          User: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
          owner: { $ref: '#/$defs/User' },
        },
        required: ['User', 'owner'],
        $defs: { User: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] } },
      },
      namespace: 'Rpc',
      className: 'Body',
      pad: 0,
    });

    assert.ok(result.includes('class _Body_User(TypedDict):\n    id: str'), result);
    assert.ok(result.includes('class _Body_User_2(TypedDict):\n    name: str'), result);
    assert.ok(result.includes('    owner: Rpc._Body_User_2'), result);
  });
});
