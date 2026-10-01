// @ts-check

// a third-party API mixed into the client; test_py fakes its server
const petstore = {
  openapi: '3.1.0',
  info: { title: 'Petstore', version: '1.0.0' },
  // the trailing slash must not end up doubled in the URL
  servers: [{ url: 'https://petstore.test/v1/' }],
  paths: {
    '/pets': {
      post: {
        operationId: 'createPets',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Pet' } } } },
        },
        responses: { 200: { description: 'ok' } },
      },
      // two content types make the body an anyOf without top-level properties
      put: {
        operationId: 'updatePet',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/Pet' } },
            'application/x-www-form-urlencoded': { schema: { $ref: '#/components/schemas/Pet' } },
          },
        },
        responses: { 200: { description: 'ok' } },
      },
    },
    '/documents': {
      post: {
        operationId: 'createDocument',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Document' } } },
        },
        responses: { 200: { description: 'ok' } },
      },
    },
    '/pets/{petId}': {
      get: {
        operationId: 'getPet',
        parameters: [{ name: 'petId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'ok', content: { 'application/json': { schema: { $ref: '#/components/schemas/Pet' } } } },
        },
      },
    },
  },
  components: {
    schemas: {
      Pet: {
        type: 'object',
        required: ['name'],
        properties: { name: { type: 'string' }, tag: { type: 'string' } },
      },
      // definitions that refer to themselves
      Json: {
        anyOf: [
          { type: 'string' },
          { type: 'number' },
          { type: 'boolean' },
          { type: 'null' },
          { type: 'array', items: { $ref: '#/components/schemas/Json' } },
          { type: 'object', additionalProperties: { $ref: '#/components/schemas/Json' } },
        ],
      },
      Tree: { type: 'object', properties: { children: { $ref: '#/components/schemas/Forest' } } },
      Forest: { type: 'array', items: { $ref: '#/components/schemas/Tree' } },
      Document: {
        type: 'object',
        required: ['data'],
        properties: { data: { $ref: '#/components/schemas/Json' }, tree: { $ref: '#/components/schemas/Tree' } },
      },
    },
  },
};

/** @type {import('vovk').VovkConfig} */
const vovkConfig = {
  logLevel: 'debug',
  outputConfig: {
    origin: `http://localhost:${process.env.PORT}`,
    segments: {
      // test_py fakes this origin
      client2: { origin: 'http://segment-origin.test', rootEntry: 'v2', segmentNameOverride: '' },
      petstore: {
        openAPIMixin: { source: { object: petstore }, getModuleName: 'PetstoreAPI', getMethodName: 'auto' },
      },
    },
  },
  clientTemplateDefs: {
    py: {
      extends: 'py',
      composedClient: {
        outDir: '../packages/vovk-python/test_py/generated_python_client',
      },
      outputConfig: {
        package: {
          name: 'test_generated_python_client',
          version: '0.0.1',
          license: 'MIT',
          description: 'Vovk Python Client',
        },
      },
    },
  },
  composedClient: {
    fromTemplates: ['py'],
  },
};

export default vovkConfig;
