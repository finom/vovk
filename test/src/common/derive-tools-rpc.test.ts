import assert from 'node:assert';
import { describe, it } from 'node:test';
import { deriveTools } from 'vovk';
import { OpenApiControllerRPC, WithValidationRPC } from 'vovk-client';

describe('deriveTools from RPC modules', () => {
  const { toolsByName } = deriveTools({
    modules: { WithValidationRPC, OpenApiControllerRPC },
  });

  const validation = WithValidationRPC.handleAll.schema.validation;
  if (!validation?.body || !validation.query || !validation.params || !validation.output) {
    throw new Error('Test precondition failed: WithValidationRPC.handleAll must declare body/query/params/output');
  }

  it('Reconstructs inputSchema from the JSON Schemas emitted to the RPC module schema', () => {
    const tool = toolsByName.WithValidationRPC_handleAll;
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
    const tool = toolsByName.WithValidationRPC_handleAll;
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

  it('Reconstructed schemas throw on validate since the original validation library is unavailable', () => {
    const tool = toolsByName.WithValidationRPC_handleAll;
    assert.throws(
      () => tool.inputSchema['~standard'].validate({ body: { hello: 'world' } }),
      /Validation is not available in this context \(inputSchema of the "WithValidationRPC_handleAll" tool\)/
    );
    assert.throws(
      () => tool.outputSchema['~standard'].validate({}),
      /Validation is not available in this context \(outputSchema of the "WithValidationRPC_handleAll" tool\)/
    );
  });

  it('Keeps inputSchema and outputSchema undefined when the RPC method has no validation', () => {
    const tool = toolsByName.OpenApiControllerRPC_openapi;
    assert.ok(tool, 'expected the tool to be derived');
    assert.strictEqual(tool.inputSchema, undefined);
    assert.strictEqual(tool.outputSchema, undefined);
  });

  it('Keeps the deprecated per-slot inputSchemas empty for RPC-derived tools', () => {
    // Per-slot Standard Schemas only exist on procedure-backed handlers (`handler.definition`)
    assert.deepStrictEqual(toolsByName.WithValidationRPC_handleAll.inputSchemas, {});
  });

  it('parameters (plain JSON Schema for function calling) still mirrors the validation schemas', () => {
    const tool = toolsByName.WithValidationRPC_handleAll;
    assert.deepStrictEqual(tool.parameters.properties, {
      body: validation.body,
      query: validation.query,
      params: validation.params,
    });
  });
});
