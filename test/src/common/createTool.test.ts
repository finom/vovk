import { it, describe } from 'node:test';
import { z } from 'zod';
import assert from 'node:assert';
import { ToModelOutput, type VovkTool, createTool } from 'vovk';
import type { MCPModelOutput, VovkToolNonDerived } from 'vovk/internal';

describe('createTool', () => {
  describe('Common, no toModelOutput', () => {
    it('No input schema, no output schema', async () => {
      const tool = createTool({
        name: 'hello_world',
        description: 'Hello World Tool',
        execute: () => {
          return { message: 'Hello, World!' };
        },
      });

      tool satisfies VovkTool<null, { message: string }, unknown>;
      tool satisfies VovkToolNonDerived<null, { message: string }, unknown>;

      const result = (await tool.execute(null)) satisfies { message: string } | { error: string };
      assert.strictEqual(tool.name, 'hello_world');
      assert.strictEqual(tool.description, 'Hello World Tool');
      assert.deepStrictEqual(result, { message: 'Hello, World!' });
    });
    it('With input schema, no output schema', async () => {
      const tool = createTool({
        name: 'hello_name',
        description: 'Hello Name Tool',
        inputSchema: z.object({
          name: z.string(),
        }),
        execute: (input) => {
          return { message: `Hello, ${input.name}!` };
        },
      });

      tool satisfies VovkToolNonDerived<{ name: string }, { message: string }, unknown>;

      const result = (await tool.execute({ name: 'Alice' })) satisfies { message: string } | { error: string };
      assert.strictEqual(tool.name, 'hello_name');
      assert.strictEqual(tool.description, 'Hello Name Tool');
      assert.deepStrictEqual(result, { message: 'Hello, Alice!' });
    });
    it('No input schema, with output schema', async () => {
      const tool = createTool({
        name: 'hello_output',
        description: 'Output Tool',
        outputSchema: z.object({
          message: z.string(),
        }),
        execute: () => {
          return { message: 'Hello from output schema!' };
        },
      });

      tool satisfies VovkToolNonDerived<null, { message: string }, unknown>;

      const result = (await tool.execute(null)) satisfies { message: string } | { error: string };
      assert.strictEqual(tool.name, 'hello_output');
      assert.strictEqual(tool.description, 'Output Tool');
      assert.deepStrictEqual(result, { message: 'Hello from output schema!' });
    });
    it('With input schema, with output schema', async () => {
      const inputSchema = z.object({
        name: z.string(),
      });
      const outputSchema = z.object({
        message: z.string(),
      });
      const tool = createTool({
        name: 'hello_full',
        description: 'Full Tool',
        inputSchema,
        outputSchema,
        execute: (input) => {
          return { message: `Hello, ${input.name}, from full tool!` };
        },
      });

      tool satisfies VovkToolNonDerived<{ name: string }, { message: string }, unknown>;

      const result = (await tool.execute({ name: 'Bob' })) satisfies { message: string } | { error: string };
      assert.strictEqual(tool.name, 'hello_full');
      assert.strictEqual(tool.description, 'Full Tool');
      assert.deepStrictEqual(result, { message: 'Hello, Bob, from full tool!' });
      assert.strictEqual(tool.inputSchema, inputSchema);
      assert.strictEqual(tool.outputSchema, outputSchema);
      assert.strictEqual(tool.inputSchemas, undefined);
    });

    it('With input validation error', async () => {
      const tool = createTool({
        name: 'validate_input',
        description: 'Input Validation Tool',
        inputSchema: z.object({
          age: z.number().min(0),
        }),
        execute: (input) => {
          return { message: `Your age is ${input.age}` };
        },
      });

      tool satisfies VovkToolNonDerived<{ age: number }, { message: string }, unknown>;

      const result = await tool.execute({ age: -5 });

      assert.deepStrictEqual(result, {
        error: 'Input validation failed. Too small: expected number to be >=0 at age',
      });
    });

    it('With output validation error', async () => {
      const tool = createTool({
        name: 'validate_output',
        description: 'Output Validation Tool',
        outputSchema: z.object({
          score: z.number().min(0).max(100),
        }),
        execute: () => {
          return { score: 150 }; // Invalid output
        },
      });

      tool satisfies VovkToolNonDerived<null, { score: number }, unknown>;

      const result = await tool.execute(null);

      assert.deepStrictEqual(result, {
        error: 'Output validation failed. Too big: expected number to be <=100 at score',
      });
    });

    it('With error output (throwing Error)', async () => {
      const tool = createTool({
        name: 'error_tool',
        description: 'Error Tool',
        inputSchema: z.number(),
        execute: (input) => {
          if (input < 0) {
            throw new Error('Something went wrong!');
          }
          return input;
        },
      });

      tool satisfies VovkToolNonDerived<number, unknown, unknown>;

      const result = await tool.execute(-1);

      assert.strictEqual(tool.name, 'error_tool');
      assert.strictEqual(tool.description, 'Error Tool');
      assert.deepStrictEqual(result, { error: 'Something went wrong!' });
    });
  });
  describe('With toModelOutput', () => {
    it('With toModelOutput = ToModelOutput.DEFAULT', async () => {
      const tool = createTool({
        name: 'hello_default',
        description: 'Default Output Tool',
        toModelOutput: ToModelOutput.DEFAULT,
        outputSchema: z.object({
          message: z.string(),
        }),
        execute: () => {
          return { message: 'Hello with default output!' };
        },
      });

      tool satisfies VovkToolNonDerived<null, { message: string }, { message: string } | { error: string }>;

      const result = (await tool.execute(null)) satisfies { message: string } | { error: string };
      assert.strictEqual(tool.name, 'hello_default');
      assert.strictEqual(tool.description, 'Default Output Tool');
      assert.deepStrictEqual(result, { message: 'Hello with default output!' });
    });

    it('With toModelOutput = ToModelOutput.DEFAULT and error', async () => {
      const tool = createTool({
        name: 'hello_default_error',
        description: 'Default Output Tool with Error',
        toModelOutput: ToModelOutput.DEFAULT,
        inputSchema: z.number(),
        outputSchema: z.object({
          message: z.string(),
        }),
        execute: (input) => {
          if (input < 0) {
            throw new Error('Default output error!');
          }
          return { message: 'Hello with default output and no error!' };
        },
      });

      tool satisfies VovkToolNonDerived<number, { message: string }, { message: string } | { error: string }>;

      const result = (await tool.execute(-5)) satisfies { message: string } | { error: string };
      assert.strictEqual(tool.name, 'hello_default_error');
      assert.strictEqual(tool.description, 'Default Output Tool with Error');
      assert.deepStrictEqual(result, { error: 'Default output error!' });
    });
    it('With toModelOutput = ToModelOutput.MCP (text)', async () => {
      const tool = createTool({
        name: 'hello_mcp_text',
        description: 'MCP Text Output Tool',
        toModelOutput: ToModelOutput.MCP,
        outputSchema: z.object({
          message: z.string(),
        }),
        execute: () => {
          return { message: 'Hello with MCP text output!' };
        },
      });

      tool satisfies VovkToolNonDerived<null, { message: string }, MCPModelOutput>;

      const result = (await tool.execute(null)) satisfies MCPModelOutput;
      assert.strictEqual(tool.name, 'hello_mcp_text');
      assert.strictEqual(tool.description, 'MCP Text Output Tool');
      assert.deepStrictEqual(result, {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ message: 'Hello with MCP text output!' }),
          },
        ],
        structuredContent: { message: 'Hello with MCP text output!' },
      });
    });
    it('With toModelOutput = ToModelOutput.MCP (image response)', async () => {
      const tool = createTool({
        name: 'hello_mcp_image',
        description: 'MCP Image Output Tool',
        toModelOutput: ToModelOutput.MCP,
        inputSchema: z.number().array(),
        execute: (input) => {
          return new Response(new Uint8Array(input), {
            headers: { 'Content-Type': 'image/png' },
          });
        },
      });

      tool satisfies VovkToolNonDerived<number[], unknown, MCPModelOutput>;

      const result = (await tool.execute([137, 80, 78, 71])) satisfies MCPModelOutput;
      assert.strictEqual(tool.name, 'hello_mcp_image');
      assert.strictEqual(tool.description, 'MCP Image Output Tool');
      assert.deepStrictEqual(result, {
        content: [
          {
            type: 'image',
            mimeType: 'image/png',
            data: 'iVBORw==',
          },
        ],
      });
    });

    it('With toModelOutput = ToModelOutput.MCP and error', async () => {
      const tool = createTool({
        name: 'hello_mcp_error',
        description: 'MCP Output Tool with Error',
        toModelOutput: ToModelOutput.MCP,
        inputSchema: z.number(),
        outputSchema: z.object({
          message: z.string(),
        }),
        execute: (input) => {
          if (input < 0) {
            throw new Error('MCP output error!');
          }
          return { message: 'Hello with MCP output and no error!' };
        },
      });

      tool satisfies VovkToolNonDerived<number, { message: string }, MCPModelOutput>;

      const result = (await tool.execute(-10)) satisfies MCPModelOutput;
      assert.strictEqual(tool.name, 'hello_mcp_error');
      assert.strictEqual(tool.description, 'MCP Output Tool with Error');
      assert.deepStrictEqual(result, {
        content: [
          {
            type: 'text',
            text: 'MCP output error!',
          },
        ],
        isError: true,
      });
    });
  });
});
