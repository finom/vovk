import { it, describe } from 'node:test';
import { withZod } from 'vovk-zod';
import { z } from 'zod';
import assert from 'node:assert';
import { deriveLLMTools, toDownloadResponse, ToModelOutput, type VovkLLMTool } from 'vovk';
import type { MCPModelOutput } from 'vovk/internal';

describe('deriveTools', () => {
  // used for multiple tests
  const handlerWithBody = withZod({
    operationObject: {
      description: 'handlerWithBody description',
    },
    body: z.object({ foo: z.string().max(5) }),
    async handle({ vovk }) {
      const { foo } = await vovk.body();
      const { inputMeta } = vovk.meta<{ inputMeta?: string }>();
      return { foo, inputMeta };
    },
  });

  describe('Common tests, implicit default toFormatOutput', () => {
    const handlerWithQuery = withZod({
      operationObject: {
        description: 'handlerWithQuery description',
      },
      query: z.object({ bar: z.string().max(5) }),
      async handle({ vovk }) {
        const { bar } = vovk.query();
        const { inputMeta } = vovk.meta<{ inputMeta?: string }>();
        return { bar, inputMeta };
      },
    });
    const handlerWithNoDescription = withZod({
      query: z.object({ bar: z.string().max(5) }),
      async handle() {
        // ...
      },
    });

    const handlerWithExcluded = withZod({
      operationObject: {
        'x-tool': { disable: true },
      },
      query: z.object({ bar: z.string().max(5) }),
      async handle() {
        // ...
      },
    });

    const handlerWithToolDescription = withZod({
      operationObject: {
        'x-tool': { description: 'handlerWithToolDescription x-tool-description' },
        description: 'handlerWithToolDescription description',
      },
      query: z.object({ bar: z.string().max(5) }),
      async handle() {
        // ...
      },
    });

    const handlerWithToolName = withZod({
      operationObject: {
        'x-tool': { name: 'customToolName' },
      },
      query: z.object({ bar: z.string().max(5) }),
      async handle() {
        // ...
      },
    });

    const { tools, toolsByName } = deriveLLMTools({
      meta: { inputMeta: 'hello' },
      modules: {
        MyModule: {
          handlerWithBody,
          handlerWithNoDescription,
          handlerWithToolDescription,
          handlerWithExcluded,
          handlerWithToolName,
        },
        MyModule2: { handlerWithQuery },
      },
    });

    tools satisfies VovkLLMTool<
      {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      },
      unknown,
      unknown,
      true
    >[];

    toolsByName satisfies {
      [key: string]: VovkLLMTool<
        {
          body?: unknown;
          query?: unknown;
          params?: unknown;
        },
        unknown,
        unknown,
        true
      >;
    };

    it('Should return tools', async () => {
      assert.equal(tools.length, 4);
      assert.deepStrictEqual(Object.keys(toolsByName), [
        'MyModule_handlerWithBody',
        'MyModule_handlerWithToolDescription',
        'customToolName',
        'MyModule2_handlerWithQuery',
      ]);
    });

    it('Should validate input', async () => {
      const tool = toolsByName['MyModule_handlerWithBody'];
      let result = await tool.execute({ body: { foo: 'foo1' } });
      assert.deepStrictEqual(result, { foo: 'foo1', inputMeta: 'hello' });
      result = await tool.execute({ body: { foo: 'foo1long' } });
      assert.deepStrictEqual(result, {
        error: 'Validation failed. Invalid body on server: Too big: expected string to have <=5 characters at foo',
      });
    });

    it('Should use proper description', async () => {
      assert.strictEqual(toolsByName['MyModule_handlerWithBody'].description, 'handlerWithBody description');
      assert.strictEqual(
        toolsByName['MyModule_handlerWithToolDescription'].description,
        'handlerWithToolDescription x-tool-description'
      );
    });
  });

  describe('Common, explicit default toModelOutput = ToModelOutput.DEFAULT', () => {
    const { tools, toolsByName } = deriveLLMTools({
      meta: { inputMeta: 'hello' },
      toModelOutput: ToModelOutput.DEFAULT,
      modules: {
        MyModule: {
          handlerWithBody,
        },
      },
    });

    tools satisfies VovkLLMTool<
      {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      },
      unknown,
      unknown,
      true
    >[];

    toolsByName satisfies {
      [key: string]: VovkLLMTool<
        {
          body?: unknown;
          query?: unknown;
          params?: unknown;
        },
        unknown,
        unknown,
        true
      >;
    };

    it('Should return tools', async () => {
      assert.equal(tools.length, 1);
      assert.deepStrictEqual(Object.keys(toolsByName), ['MyModule_handlerWithBody']);
    });

    it('Should validate input', async () => {
      const tool = toolsByName['MyModule_handlerWithBody'];
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
      const { tools, toolsByName } = deriveLLMTools({
        meta: { inputMeta: 'hello' },
        toModelOutput: ToModelOutput.MCP,
        modules: {
          MyModule: { handlerWithBody },
        },
      });

      tools satisfies VovkLLMTool<
        {
          body?: unknown;
          query?: unknown;
          params?: unknown;
        },
        unknown,
        MCPModelOutput,
        true
      >[];

      toolsByName satisfies {
        [key: string]: VovkLLMTool<
          {
            body?: unknown;
            query?: unknown;
            params?: unknown;
          },
          unknown,
          MCPModelOutput,
          true
        >;
      };

      it('Should validate input', async () => {
        const tool = toolsByName['MyModule_handlerWithBody'];
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
      const { toolsByName } = deriveLLMTools({
        toModelOutput: ToModelOutput.MCP,
        modules: {
          MyModule: {
            withAudioResponse: withZod({
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

      it('Should return audio MCPModelOutput', async () => {
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
      const { toolsByName } = deriveLLMTools({
        toModelOutput: ToModelOutput.MCP,
        modules: {
          MyModule: {
            withImageResponse: withZod({
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

      it('Should return image MCPModelOutput', async () => {
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
      const { toolsByName } = deriveLLMTools({
        toModelOutput: ToModelOutput.MCP,
        modules: {
          MyModule: {
            withImageResponse: withZod({
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

      it('Should return fetched image MCPModelOutput', async () => {
        const result: MCPModelOutput = await toolsByName.withImageResponse.execute({});
        assert.deepStrictEqual(result.content[0].type, 'image');
        assert.deepStrictEqual(result.content[0].mimeType, 'image/jpeg');
        assert.ok(result.content[0].data.length > 0, 'Image data should not be empty');
        assert.ok(typeof result.content[0].data === 'string', 'Image data should be a base64 string');
      });
    });

    describe('CSV Response instance', () => {
      const { toolsByName } = deriveLLMTools({
        toModelOutput: ToModelOutput.MCP,
        modules: {
          MyModule: {
            withCSVResponse: withZod({
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

      it('Should return CSV MCPModelOutput', async () => {
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
      const { toolsByName } = deriveLLMTools({
        toModelOutput: ToModelOutput.MCP,
        modules: {
          MyModule: {
            withTextResponse: withZod({
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

      it('Should return text MCPModelOutput', async () => {
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
      const { toolsByName } = deriveLLMTools({
        toModelOutput: ToModelOutput.MCP,
        modules: {
          MyModule: {
            withJSONResponse: withZod({
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
  });

  describe('Custom Result Formatter', () => {
    const { tools, toolsByName } = deriveLLMTools({
      meta: { inputMeta: 'hello' },
      toModelOutput: async (result) => {
        if (result instanceof Error) {
          return { myError: String(result) };
        }
        return { myResult: result };
      },
      modules: {
        MyModule: { handlerWithBody },
      },
    });

    tools satisfies VovkLLMTool<
      {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      },
      unknown,
      { myResult?: unknown; myError?: string },
      true
    >[];

    toolsByName satisfies {
      [key: string]: VovkLLMTool<
        {
          body?: unknown;
          query?: unknown;
          params?: unknown;
        },
        unknown,
        { myResult?: unknown; myError?: string },
        true
      >;
    };

    it('Should validate input', async () => {
      const tool = toolsByName['MyModule_handlerWithBody'];
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
