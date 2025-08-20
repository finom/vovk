import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { convertJSONSchemaToPythonDataType } from '../index.js'; // Replace with your actual module path

test('convertJSONSchemaToPythonDataType - simple types', async (t) => {
  await t.test('converts string schema', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: { type: 'string' },
      namespace: 'MyNamespace',
      className: 'MyString',
      pad: 0,
    });

    assert.equal(result, 'MyString = str');
  });

  await t.test('converts integer schema', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: { type: 'integer' },
      namespace: 'MyNamespace',
      className: 'MyInteger',
      pad: 0,
    });

    assert.equal(result, 'MyInteger = int');
  });

  await t.test('converts number schema', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: { type: 'number' },
      namespace: 'MyNamespace',
      className: 'MyNumber',
      pad: 0,
    });

    assert.equal(result, 'MyNumber = float');
  });

  await t.test('converts boolean schema', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: { type: 'boolean' },
      namespace: 'MyNamespace',
      className: 'MyBoolean',
      pad: 0,
    });

    assert.equal(result, 'MyBoolean = bool');
  });

  await t.test('converts null schema', () => {
    const result = convertJSONSchemaToPythonDataType({
      schema: { type: 'null' },
      namespace: 'MyNamespace',
      className: 'MyNull',
      pad: 0,
    });

    assert.equal(result, 'MyNull = None');
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

    assert.equal(result, 'StringArray = List[str]');
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

    assert.equal(result, 'AnyArray = List[Any]');
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

    assert.equal(result, 'MyTuple = Tuple[str, int, bool]');
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

    assert.equal(result, 'StringEnum = Literal["one", "two", "three"]');
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

    assert.equal(result, 'NumericEnum = Literal[1, 2, 3]');
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

    assert.equal(result, 'OptionalString = Union[str, None]');
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

    assert.equal(result, 'StringOrInt = Union[str, int]');
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

    assert.equal(result, 'MixedTypes = Union[str, int, bool]');
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
    age: Optional[int]`;

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

    const expected = `class __Person_address(TypedDict):
    street: str
    city: str
    zipCode: Optional[str]
class Person(TypedDict):
    name: str
    address: MyNamespace.__Person_address`;

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

    const expected = `class __Person_friends_items(TypedDict):
    name: str
    age: Optional[int]
class Person(TypedDict):
    name: str
    tags: Optional[List[str]]
    friends: Optional[List[MyNamespace.__Person_friends_items]]`;

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
    email: Optional[str]
    age: Optional[int]
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

    const expected = `  class __Response_user_profile_personal(TypedDict):
      name: str
      age: Optional[int]
  class __Response_user_profile_preferences(TypedDict):
      theme: Optional[Literal["light", "dark"]]
      notifications: Optional[bool]
  class __Response_user_profile(TypedDict):
      personal: Optional[API.__Response_user_profile_personal]
      preferences: Optional[API.__Response_user_profile_preferences]
  class __Response_user_posts_items(TypedDict):
      title: str
      content: str
      tags: Optional[List[str]]
  class __Response_user(TypedDict):
      profile: Optional[API.__Response_user_profile]
      posts: Optional[List[API.__Response_user_posts_items]]
  class Response(TypedDict):
      user: Optional[API.__Response_user]`;

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

    assert.equal(result, 'EmptySchema = Any');
  });

  await t.test('handles null schema', () => {
    const result = convertJSONSchemaToPythonDataType({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      schema: null as any,
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
        name: Optional[str]
        age: Optional[int]`;

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

    const expected = `class __Response_data_users_items_meta(TypedDict):
    pass
class __Response_data_users_items(TypedDict):
    id: str
    name: str
    email: str
    role: Optional[Literal["admin", "user", "guest"]]
    meta: Optional[API.__Response_data_users_items_meta]
class __Response_data_pagination(TypedDict):
    page: int
    totalPages: int
    nextPage: Optional[Union[int, None]]
    prevPage: Optional[Union[int, None]]
class __Response_data(TypedDict):
    users: List[API.__Response_data_users_items]
    pagination: Optional[API.__Response_data_pagination]
class __Response_error(TypedDict):
    message: str
    details: Optional[List[str]]
class Response(TypedDict):
    status: Literal["success", "error"]
    code: int
    data: Optional[API.__Response_data]
    error: Optional[API.__Response_error]`;

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

    const expected = `class __AppConfig_serverConfig_corsOptions_anyOf_1(TypedDict):
    origin: Optional[Union[str, List[str]]]
    methods: Optional[List[str]]
    allowHeaders: Optional[List[str]]
class __AppConfig_serverConfig(TypedDict):
    host: str
    port: int
    ssl: Optional[bool]
    corsOptions: Optional[Union[bool, Config.__AppConfig_serverConfig_corsOptions_anyOf_1]]
class __AppConfig_database_credentials(TypedDict):
    user: str
    password: str
    host: str
    port: Optional[int]
class __AppConfig_database(TypedDict):
    type: Literal["mysql", "postgres", "mongodb"]
    name: str
    credentials: Config.__AppConfig_database_credentials
class __AppConfig_features_auth_providers_items_config(TypedDict):
    pass
class __AppConfig_features_auth_providers_items(TypedDict):
    name: str
    config: Optional[Config.__AppConfig_features_auth_providers_items_config]
class __AppConfig_features_auth(TypedDict):
    enabled: Optional[bool]
    providers: Optional[List[Config.__AppConfig_features_auth_providers_items]]
class __AppConfig_features_caching(TypedDict):
    strategy: Optional[Literal["memory", "redis"]]
    ttl: Optional[int]
class __AppConfig_features(TypedDict):
    auth: Optional[Config.__AppConfig_features_auth]
    caching: Optional[Config.__AppConfig_features_caching]
class AppConfig(TypedDict):
    serverConfig: Config.__AppConfig_serverConfig
    database: Config.__AppConfig_database
    features: Optional[Config.__AppConfig_features]`;

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
    updatedAt: Optional[str]
    email: str
    website: Optional[str]
    ipAddress: Optional[str]`;

    assert.equal(result, expected);
  });
});
