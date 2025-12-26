import { it, describe } from 'node:test';
import { z } from 'zod';
import assert from 'node:assert';
import { deriveTools, toDownloadResponse, ToModelOutput, procedure, type VovkTool, type VovkOutput } from 'vovk';
import type { MCPModelOutput, VovkToolDerived } from 'vovk/internal';

describe('deriveTools', () => {
  const outputSchema = z.object({ foo: z.string().max(5), inputMeta: z.string().optional() });
  const bodySchema = z.object({ foo: z.string().max(5) });
  const querySchema = z.object({ bar: z.string().max(5) });
  // used for multiple tests
  const procedureWithBody = procedure({
    operationObject: {
      description: 'procedureWithBody description',
    },
    body: bodySchema,
    output: outputSchema,
    async handle({ vovk }) {
      const { foo } = await vovk.body();
      const { inputMeta } = vovk.meta<{ inputMeta?: string }>();
      return { foo, inputMeta } satisfies VovkOutput<typeof procedureWithBody>;
    },
  });

  describe('Common tests, implicit default toFormatOutput', () => {
    const procedureWithQuery = procedure({
      operationObject: {
        description: 'procedureWithQuery description',
      },
      query: querySchema,
      async handle({ vovk }) {
        const { bar } = vovk.query();
        const { inputMeta } = vovk.meta<{ inputMeta?: string }>();
        return { bar, inputMeta };
      },
    });
    const procedureWithNoDescription = procedure({
      query: querySchema,
      async handle() {
        // ...
      },
    });

    const procedureWithExcluded = procedure({
      operationObject: {
        'x-tool': { hidden: true },
      },
      query: querySchema,
      async handle() {
        // ...
      },
    });

    const procedureWithToolDescription = procedure({
      operationObject: {
        'x-tool': { description: 'procedureWithToolDescription x-tool-description' },
        description: 'procedureWithToolDescription description',
      },
      query: z.object({ bar: z.string().max(5) }),
      async handle() {
        // ...
      },
    });

    const procedureWithToolName = procedure({
      operationObject: {
        'x-tool': { name: 'customToolName' },
      },
      query: z.object({ bar: z.string().max(5) }),
      async handle() {
        // ...
      },
    });

    const { tools, toolsByName } = deriveTools({
      meta: { inputMeta: 'hello' },
      modules: {
        MyModule: {
          procedureWithBody,
          procedureWithNoDescription,
          procedureWithToolDescription,
          procedureWithExcluded,
          procedureWithToolName,
        },
        MyModule2: { procedureWithQuery },
      },
      onExecute: (result) => console.log('onExecute', result),
    });

    tools satisfies VovkTool<
      {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      },
      unknown,
      unknown
    >[];

    tools satisfies VovkToolDerived<
      {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      },
      unknown,
      unknown
    >[];

    toolsByName satisfies {
      [key: string]: VovkToolDerived<
        {
          body?: unknown;
          query?: unknown;
          params?: unknown;
        },
        unknown,
        unknown
      >;
    };

    it('Should return tools', async () => {
      assert.equal(tools.length, 4);
      assert.deepStrictEqual(Object.keys(toolsByName), [
        'MyModule_procedureWithBody',
        'MyModule_procedureWithToolDescription',
        'customToolName',
        'MyModule2_procedureWithQuery',
      ]);
    });

    it('Should provide outputSchema', async () => {
      const tool = toolsByName['MyModule_procedureWithBody'];
      assert.deepStrictEqual(tool.outputSchema, outputSchema);
    });

    it('Should provide inputSchemas', async () => {
      const toolProcedureWithBody = toolsByName['MyModule_procedureWithBody'];
      const toolProcedureWithQuery = toolsByName['MyModule2_procedureWithQuery'];
      assert.deepStrictEqual(toolProcedureWithBody.inputSchemas, {
        body: bodySchema,
      });

      assert.deepStrictEqual(toolProcedureWithQuery.inputSchemas, {
        query: querySchema,
      });
    });

    it('Should NOT provide inputSchema', async () => {
      const tool = toolsByName['MyModule_procedureWithBody'];
      assert.strictEqual(tool.inputSchema, undefined);
    });

    it('Should validate input', async () => {
      const tool = toolsByName['MyModule_procedureWithBody'];
      let result = await tool.execute({ body: { foo: 'foo1' } });
      assert.deepStrictEqual(result, { foo: 'foo1', inputMeta: 'hello' });
      result = await tool.execute({ body: { foo: 'foo1long' } });
      assert.deepStrictEqual(result, {
        error: 'Validation failed. Invalid body on server: Too big: expected string to have <=5 characters at foo',
      });
    });

    it('Should use proper description', async () => {
      assert.strictEqual(toolsByName['MyModule_procedureWithBody'].description, 'procedureWithBody description');
      assert.strictEqual(
        toolsByName['MyModule_procedureWithToolDescription'].description,
        'procedureWithToolDescription x-tool-description'
      );
    });
  });

  describe('Explicit custom toModelOutput', () => {
    const { tools, toolsByName } = deriveTools({
      meta: { inputMeta: 'hello' },
      toModelOutput: async (result) => {
        if (result instanceof Error) {
          return { myError: String(result) };
        }
        return { myResult: result };
      },
      modules: {
        MyModule: { procedureWithBody },
      },
    });

    tools satisfies VovkToolDerived<
      {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      },
      unknown,
      { myResult?: unknown; myError?: string }
    >[];
    toolsByName satisfies {
      [key: string]: VovkToolDerived<
        {
          body?: unknown;
          query?: unknown;
          params?: unknown;
        },
        unknown,
        { myResult?: unknown; myError?: string }
      >;
    };

    it('Should validate input', async () => {
      const tool = toolsByName['MyModule_procedureWithBody'];
      let result = await tool.execute({ body: { foo: 'foo1' } });
      assert.deepStrictEqual(result, { myResult: { foo: 'foo1', inputMeta: 'hello' } });
      result = await tool.execute({ body: { foo: 'foo1long' } });
      assert.deepStrictEqual(result, {
        myError:
          'Error: Validation failed. Invalid body on server: Too big: expected string to have <=5 characters at foo',
      });
    });
  });

  describe('Explicit default toModelOutput = ToModelOutput.DEFAULT', () => {
    const { tools, toolsByName } = deriveTools({
      meta: { inputMeta: 'hello' },
      toModelOutput: ToModelOutput.DEFAULT,
      modules: {
        MyModule: {
          procedureWithBody,
        },
      },
    });

    tools satisfies VovkToolDerived<
      {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      },
      unknown,
      unknown
    >[];

    toolsByName satisfies {
      [key: string]: VovkToolDerived<
        {
          body?: unknown;
          query?: unknown;
          params?: unknown;
        },
        unknown,
        unknown
      >;
    };

    it('Should return tools', async () => {
      assert.equal(tools.length, 1);
      assert.deepStrictEqual(Object.keys(toolsByName), ['MyModule_procedureWithBody']);
    });

    it('Should validate input', async () => {
      const tool = toolsByName['MyModule_procedureWithBody'];
      let result = await tool.execute({ body: { foo: 'foo1' } });
      assert.deepStrictEqual(result, { foo: 'foo1', inputMeta: 'hello' });
      result = await tool.execute({ body: { foo: 'foo1long' } });
      assert.deepStrictEqual(result, {
        error: 'Validation failed. Invalid body on server: Too big: expected string to have <=5 characters at foo',
      });
    });
  });

  describe('toModelOutput = ToModelOutput.MCP', () => {
    describe('Common, normal JSON output', () => {
      const { tools, toolsByName } = deriveTools({
        meta: { inputMeta: 'hello' },
        toModelOutput: ToModelOutput.MCP,
        modules: {
          MyModule: { procedureWithBody },
        },
        onExecute: (result, { name }) => console.log(`${name} executed`, result),
      });

      tools satisfies VovkToolDerived<
        {
          body?: unknown;
          query?: unknown;
          params?: unknown;
        },
        unknown,
        MCPModelOutput
      >[];

      toolsByName satisfies {
        [key: string]: VovkToolDerived<
          {
            body?: unknown;
            query?: unknown;
            params?: unknown;
          },
          unknown,
          MCPModelOutput
        >;
      };

      it('Should validate input', async () => {
        const tool = toolsByName['MyModule_procedureWithBody'];
        let result: MCPModelOutput = await tool.execute({ body: { foo: 'foo1' } });
        assert.deepStrictEqual(result, {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ foo: 'foo1', inputMeta: 'hello' }),
            },
          ],
          structuredContent: { foo: 'foo1', inputMeta: 'hello' },
        });
        result = await tool.execute({ body: { foo: 'foo1long' } });
        assert.deepStrictEqual(result, {
          content: [
            {
              type: 'text',
              text: 'Validation failed. Invalid body on server: Too big: expected string to have <=5 characters at foo',
            },
          ],
          isError: true,
        });
      });
    });

    describe('Audio Response instance', () => {
      const { toolsByName } = deriveTools({
        toModelOutput: ToModelOutput.MCP,
        modules: {
          MyModule: {
            withAudioResponse: procedure({
              operationObject: {
                summary: 'Returns an audio response',
                'x-tool': { name: 'withAudioResponse' },
              },
              async handle() {
                return toDownloadResponse(new Uint8Array([1, 2, 3, 4, 5]).buffer, {
                  type: 'audio/wav',
                  filename: 'test.wav',
                });
              },
            }),
          },
        },
      });

      it('Should return audio output', async () => {
        const result: MCPModelOutput = await toolsByName.withAudioResponse.execute({});
        assert.deepStrictEqual(result, {
          content: [
            {
              type: 'audio',
              mimeType: 'audio/wav',
              data: 'AQIDBAU=',
            },
          ],
        });
      });
    });

    describe('Image Response instance', () => {
      // 2x2 red PNG image
      const { toolsByName } = deriveTools({
        toModelOutput: ToModelOutput.MCP,
        modules: {
          MyModule: {
            withImageResponse: procedure({
              operationObject: {
                summary: 'Returns an image response',
                'x-tool': { name: 'withImageResponse' },
              },
              async handle() {
                return toDownloadResponse(
                  Uint8Array.from([
                    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
                    0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x02, 0x08, 0x02, 0x00, 0x00, 0x00, 0xfd, 0xd4, 0x9a,
                    0x73, 0x00, 0x00, 0x00, 0x0e, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
                    0x00, 0x01, 0x01, 0x01, 0x00, 0x18, 0xdd, 0x8d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
                    0x44, 0xae, 0x42, 0x60, 0x82,
                  ]).buffer,
                  {
                    type: 'image/png',
                    filename: 'test.png',
                  }
                );
              },
            }),
          },
        },
      });

      it('Should return image output', async () => {
        const result: MCPModelOutput = await toolsByName.withImageResponse.execute({});
        assert.deepStrictEqual(result, {
          content: [
            {
              type: 'image',
              mimeType: 'image/png',
              data: 'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAADklEQVQI12P4z8AAAAEBAQAY3Y20AAAAAElFTkSuQmCC',
            },
          ],
        });
      });
    });

    describe('Image Response instance (fetch)', () => {
      const { toolsByName } = deriveTools({
        toModelOutput: ToModelOutput.MCP,
        modules: {
          MyModule: {
            withImageResponse: procedure({
              operationObject: {
                summary: 'Returns an image response',
                'x-tool': { name: 'withImageResponse' },
              },
              async handle() {
                return fetch('https://picsum.photos/2/2');
              },
            }),
          },
        },
      });

      it('Should return fetched image output', async () => {
        const result: MCPModelOutput = await toolsByName.withImageResponse.execute({});
        assert.deepStrictEqual(result.content[0].type, 'image');
        assert.deepStrictEqual(result.content[0].mimeType, 'image/jpeg');
        assert.ok(result.content[0].data.length > 0, 'Image data should not be empty');
        assert.ok(typeof result.content[0].data === 'string', 'Image data should be a base64 string');
      });
    });

    describe('CSV Response instance', () => {
      const { toolsByName } = deriveTools({
        toModelOutput: ToModelOutput.MCP,
        modules: {
          MyModule: {
            withCSVResponse: procedure({
              operationObject: {
                summary: 'Returns a CSV response',
                'x-tool': { name: 'withCSVResponse' },
              },
              async handle() {
                const csvContent = 'name,age\nAlice,30\nBob,25';
                return toDownloadResponse(csvContent, {
                  type: 'text/csv',
                  filename: 'test.csv',
                });
              },
            }),
          },
        },
      });

      it('Should return CSV output', async () => {
        const result: MCPModelOutput = await toolsByName.withCSVResponse.execute({});
        assert.deepStrictEqual(result, {
          content: [
            {
              type: 'text',
              text: 'name,age\nAlice,30\nBob,25',
            },
          ],
        });
      });
    });

    describe('Text Response instance', () => {
      const { toolsByName } = deriveTools({
        toModelOutput: ToModelOutput.MCP,
        modules: {
          MyModule: {
            withTextResponse: procedure({
              operationObject: {
                summary: 'Returns a text response',
                'x-tool': { name: 'withTextResponse' },
              },
              async handle() {
                return new Response('Hello, this is a text response.', {
                  headers: { 'Content-Type': 'text/plain' },
                });
              },
            }),
          },
        },
      });

      it('Should return text output', async () => {
        const result: MCPModelOutput = await toolsByName.withTextResponse.execute({});
        assert.deepStrictEqual(result, {
          content: [
            {
              type: 'text',
              text: 'Hello, this is a text response.',
            },
          ],
        });
      });
    });

    describe('JSON Response instance', () => {
      const { toolsByName } = deriveTools({
        toModelOutput: ToModelOutput.MCP,
        modules: {
          MyModule: {
            withJSONResponse: procedure({
              operationObject: {
                summary: 'Returns a JSON response',
                'x-tool': { name: 'withJSONResponse' },
              },
              async handle() {
                return new Response(JSON.stringify({ message: 'Hello, this is a JSON response.' }), {
                  headers: { 'Content-Type': 'application/json' },
                });
              },
            }),
          },
        },
      });

      it('Should return JSON MCPModelOutput', async () => {
        const result: MCPModelOutput = await toolsByName.withJSONResponse.execute({});
        assert.deepStrictEqual(result, {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ message: 'Hello, this is a JSON response.' }),
            },
          ],
          structuredContent: { message: 'Hello, this is a JSON response.' },
        });
      });
    });

    it('Should support MCP annotations', async () => {
      const procedureWithAnnotations = procedure({
        operationObject: {
          'x-tool': {
            name: 'procedureWithAnnotations',
          },
          description: 'procedureWithAnnotations description',
        },
        body: z.object({ foo: z.string().max(5) }),
        async handle({ vovk }) {
          const { foo } = await vovk.body();
          vovk.meta({ mcpOutput: { annotations: { audience: ['user'], priority: 5 } } });

          return { foo };
        },
      });

      const { toolsByName } = deriveTools({
        toModelOutput: ToModelOutput.MCP,
        modules: {
          MyModule: {
            procedureWithAnnotations,
          },
        },
      });

      const result: MCPModelOutput = await toolsByName.procedureWithAnnotations.execute({ body: { foo: 'bar' } });
      assert.deepStrictEqual(result, {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ foo: 'bar' }),
          },
        ],
        structuredContent: { foo: 'bar' },
        annotations: { audience: ['user'], priority: 5 },
      });
    });
  });

  describe('Custom Result Formatter', () => {
    const { tools, toolsByName } = deriveTools({
      meta: { inputMeta: 'hello' },
      toModelOutput: async (result) => {
        if (result instanceof Error) {
          return { myError: String(result) };
        }
        return { myResult: result };
      },
      modules: {
        MyModule: { procedureWithBody },
      },
    });

    tools satisfies VovkToolDerived<
      {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      },
      unknown,
      { myResult?: unknown; myError?: string }
    >[];

    toolsByName satisfies {
      [key: string]: VovkToolDerived<
        {
          body?: unknown;
          query?: unknown;
          params?: unknown;
        },
        unknown,
        { myResult?: unknown; myError?: string }
      >;
    };

    it('Should validate input', async () => {
      const tool = toolsByName['MyModule_procedureWithBody'];
      let result = await tool.execute({ body: { foo: 'foo1' } });
      assert.deepStrictEqual(result, { myResult: { foo: 'foo1', inputMeta: 'hello' } });
      result = await tool.execute({ body: { foo: 'foo1long' } });
      assert.deepStrictEqual(result, {
        myError:
          'Error: Validation failed. Invalid body on server: Too big: expected string to have <=5 characters at foo',
      });
    });
  });
});
