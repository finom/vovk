import assert from 'node:assert';
import { describe, it } from 'node:test';
import { deriveTools } from 'vovk';
import { OpenApiControllerRPC, WithValidationRPC } from '../generated-client/index.ts';

describe('deriveTools from RPC modules', () => {
  const tools = deriveTools({
    modules: { WithValidationRPC, OpenApiControllerRPC },
  });

  const handleAllTool = tools.find(({ name }) => name === 'WithValidationRPC_handleAll');
  if (!handleAllTool) {
    throw new Error('Test precondition failed: the WithValidationRPC_handleAll tool must be derived');
  }

  const validation = WithValidationRPC.handleAll.schema.validation;
  if (!validation?.body || !validation.query || !validation.params || !validation.output) {
    throw new Error('Test precondition failed: WithValidationRPC.handleAll must declare body/query/params/output');
  }

  it('Reconstructs inputSchema from the JSON Schemas emitted to the RPC module schema', () => {
    const tool = handleAllTool;
    assert.ok(tool.inputSchema, 'expected inputSchema to be defined for an RPC-derived tool');
    assert.strictEqual(tool.inputSchema['~standard'].vendor, 'vovk');
    assert.strictEqual(tool.inputSchema['~standard'].version, 1);
    // Same envelope as the merged inputSchema of procedure-derived tools
    const expected = {
      type: 'object',
      properties: {
        body: validation.body,
        query: validation.query,
        params: validation.params,
      },
      required: ['body', 'query', 'params'],
      additionalProperties: false,
    };
    assert.deepStrictEqual(tool.inputSchema['~standard'].jsonSchema.input({ target: 'draft-2020-12' }), expected);
    assert.deepStrictEqual(tool.inputSchema['~standard'].jsonSchema.output({ target: 'draft-2020-12' }), expected);
  });

  it('Reconstructs outputSchema from the output JSON Schema emitted to the RPC module schema', () => {
    const tool = handleAllTool;
    assert.ok(tool.outputSchema, 'expected outputSchema to be defined for an RPC-derived tool');
    assert.strictEqual(tool.outputSchema['~standard'].vendor, 'vovk');
    assert.strictEqual(tool.outputSchema['~standard'].version, 1);
    assert.deepStrictEqual(
      tool.outputSchema['~standard'].jsonSchema.input({ target: 'draft-2020-12' }),
      validation.output
    );
    assert.deepStrictEqual(
      tool.outputSchema['~standard'].jsonSchema.output({ target: 'draft-2020-12' }),
      validation.output
    );
  });

  it('Reconstructed inputSchema validates the envelope and lets slot contents pass', async () => {
    const spec = handleAllTool.inputSchema?.['~standard'];
    assert.ok(spec);
    // slot contents are not checked here, the server validates them during execute
    const input = { body: { hello: 42 }, query: {}, params: {} };
    assert.deepStrictEqual(await spec.validate(input), { value: input });
    assert.deepStrictEqual(await spec.validate({ body: {} }), {
      issues: [
        { message: 'Required', path: [{ key: 'query' }] },
        { message: 'Required', path: [{ key: 'params' }] },
      ],
    });
    assert.deepStrictEqual(await spec.validate({ body: {}, query: {}, params: {}, extra: 1 }), {
      issues: [{ message: 'Unexpected key', path: [{ key: 'extra' }] }],
    });
    assert.deepStrictEqual(await spec.validate(null), {
      issues: [{ message: 'Expected object', path: [] }],
    });
  });

  it('Reconstructed outputSchema always passes validate', async () => {
    const spec = handleAllTool.outputSchema?.['~standard'];
    assert.ok(spec);
    const output = { anything: true };
    assert.deepStrictEqual(await spec.validate(output), { value: output });
  });

  it('Keeps inputSchema and outputSchema undefined when the RPC method has no validation', () => {
    const tool = tools.find(({ name }) => name === 'OpenApiControllerRPC_openapi');
    assert.ok(tool, 'expected the tool to be derived');
    assert.strictEqual(tool.inputSchema, undefined);
    assert.strictEqual(tool.outputSchema, undefined);
  });
});
