import assert from 'node:assert';
import { describe, it } from 'node:test';
import { Ajv } from 'ajv';
import { Ajv2020 } from 'ajv/dist/2020.js';
import { deriveTools, procedure } from 'vovk';
import { createRPC } from 'vovk/create-rpc';
import { openAPIToVovkSchema } from 'vovk/internal';
import { z } from 'zod';
import { validationSchemasObjectToSingleValidationSchema } from '../../../packages/vovk/dist/validation/validation-schemas-object-to-single-validation-schema.js';

type Tool = ReturnType<typeof deriveTools>[number];

function inputJSONSchema(tool: Tool, target: 'draft-2020-12' | 'draft-07' = 'draft-2020-12') {
  assert.ok(tool.inputSchema, `expected ${tool.name} to have an inputSchema`);
  return tool.inputSchema['~standard'].jsonSchema.input({ target });
}

// compiles the envelope the way a tool consumer does and returns a validator for whole inputs
function compile(jsonSchema: Record<string, unknown>, target: 'draft-2020-12' | 'draft-07' = 'draft-2020-12') {
  const ajv = target === 'draft-07' ? new Ajv({ strict: false }) : new Ajv2020({ strict: false });
  return ajv.compile(jsonSchema);
}

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

const validTree = { value: 1, children: [{ value: 2, children: [] }] };
const invalidTree = { value: 1, children: [{ value: 'two', children: [] }] };

describe('deriveTools inputSchema refs', () => {
  it('Resolves the component refs of an OpenAPI mixin slot', () => {
    const schema = openAPIToVovkSchema({
      source: {
        object: {
          openapi: '3.1.0',
          info: { title: 'Issues', version: '1.0.0' },
          servers: [{ url: 'https://api.example.com' }],
          components: {
            schemas: {
              IssueInput: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  labels: { type: 'array', items: { $ref: '#/components/schemas/Label' } },
                },
                required: ['title'],
              },
              Label: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] },
            },
          },
          paths: {
            '/issues': {
              post: {
                operationId: 'createIssue',
                requestBody: {
                  content: { 'application/json': { schema: { $ref: '#/components/schemas/IssueInput' } } },
                },
                responses: { '201': { description: 'Created' } },
              },
            },
          },
        },
      },
      getModuleName: () => 'IssuesAPI',
      getMethodName: ({ operationObject }) => operationObject.operationId ?? 'unknown',
    });
    const IssuesAPI = createRPC(schema, '', 'IssuesAPI');
    const [tool] = deriveTools({ modules: { IssuesAPI } });
    const validate = compile(inputJSONSchema(tool));

    assert.strictEqual(validate({ body: { title: 'Bug', labels: [{ name: 'p1' }] } }), true);
    assert.strictEqual(validate({ body: { labels: [] } }), false, 'IssueInput.title is required');
    assert.strictEqual(validate({ body: { title: 'Bug', labels: [{}] } }), false, 'Label.name is required');
  });

  it('Resolves a recursive Zod schema nested in a procedure slot', () => {
    const create = procedure({ operationObject: { summary: 'Create' }, body: z.object({ tree: Tree }) }).handle(
      async () => null
    );
    const [tool] = deriveTools({ modules: { TreeModule: { create } } });
    const validate = compile(inputJSONSchema(tool));

    assert.strictEqual(validate({ body: { tree: validTree } }), true);
    assert.strictEqual(validate({ body: { tree: invalidTree } }), false);
  });

  it('Keeps the defs of two slots apart when Zod gives them the same name', () => {
    const create = procedure({
      operationObject: { summary: 'Create' },
      body: z.object({ tree: Tree }),
      query: z.object({ folder: Folder }),
    }).handle(async () => null);
    const [tool] = deriveTools({ modules: { TreeModule: { create } } });
    const jsonSchema = inputJSONSchema(tool);
    const validate = compile(jsonSchema);

    assert.strictEqual(Object.keys(jsonSchema.$defs as object).length, 2, 'both __schema0 defs are kept');
    assert.strictEqual(validate({ body: { tree: validTree }, query: { folder: { name: 'a', folders: [] } } }), true);
    assert.strictEqual(validate({ body: { tree: invalidTree }, query: { folder: { name: 'a', folders: [] } } }), false);
    assert.strictEqual(validate({ body: { tree: validTree }, query: { folder: { name: 1, folders: [] } } }), false);
  });

  it('Resolves a slot whose root refers to itself', () => {
    const create = procedure({ operationObject: { summary: 'Create' }, body: Tree }).handle(async () => null);
    const [tool] = deriveTools({ modules: { TreeModule: { create } } });

    for (const target of ['draft-2020-12', 'draft-07'] as const) {
      const validate = compile(inputJSONSchema(tool, target), target);
      assert.strictEqual(validate({ body: validTree }), true, target);
      assert.strictEqual(validate({ body: invalidTree }), false, target);
    }
  });

  it('Moves draft-07 definitions to the envelope root', () => {
    const create = procedure({ operationObject: { summary: 'Create' }, body: z.object({ tree: Tree }) }).handle(
      async () => null
    );
    const [tool] = deriveTools({ modules: { TreeModule: { create } } });
    const validate = compile(inputJSONSchema(tool, 'draft-07'), 'draft-07');

    assert.strictEqual(validate({ body: { tree: validTree } }), true);
    assert.strictEqual(validate({ body: { tree: invalidTree } }), false);
  });

  it('Converts back to Zod with z.fromJSONSchema, as the MCP handler example does', () => {
    const create = procedure({
      operationObject: { summary: 'Create' },
      body: z.object({ tree: Tree }),
      query: z.object({ folder: Folder }),
    }).handle(async () => null);
    const [tool] = deriveTools({ modules: { TreeModule: { create } } });
    const zodSchema = z.fromJSONSchema(inputJSONSchema(tool));

    assert.strictEqual(
      zodSchema.safeParse({ body: { tree: validTree }, query: { folder: { name: 'a', folders: [] } } }).success,
      true
    );
    assert.strictEqual(
      zodSchema.safeParse({ body: { tree: invalidTree }, query: { folder: { name: 'a', folders: [] } } }).success,
      false
    );
  });

  it('Leaves slots without refs as they are', () => {
    const body = z.object({ name: z.string() });
    const merged = validationSchemasObjectToSingleValidationSchema({ body });
    assert.deepStrictEqual(merged['~standard'].jsonSchema.input({ target: 'draft-2020-12' }), {
      type: 'object',
      properties: { body: body['~standard'].jsonSchema.input({ target: 'draft-2020-12' }) },
      required: ['body'],
      additionalProperties: false,
    });
  });
});
