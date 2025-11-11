import { it, describe } from 'node:test';
import { withZod } from 'vovk-zod';
import { z } from 'zod';
import assert from 'node:assert';
import { createLLMTools, HttpException } from 'vovk';

describe('createLLMTools', async () => {
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
      'x-tool-disable': true,
    },
    query: z.object({ bar: z.string().max(5) }),
    async handle() {
      // ...
    },
  });

  const handlerWithToolDescription = withZod({
    operationObject: {
      'x-tool-description': 'handlerWithToolDescription x-tool-description',
      description: 'handlerWithToolDescription description',
    },
    query: z.object({ bar: z.string().max(5) }),
    async handle() {
      // ...
    },
  });

  const handlerWithToolName = withZod({
    operationObject: {
      'x-tool-name': 'customToolName',
    },
    query: z.object({ bar: z.string().max(5) }),
    async handle() {
      // ...
    },
  });

  describe('Common', () => {
    const { tools, toolsByName } = createLLMTools({
      meta: { inputMeta: 'hello' },
      modules: {
        MyModule1: {
          handlerWithBody,
          handlerWithNoDescription,
          handlerWithToolDescription,
          handlerWithExcluded,
          handlerWithToolName,
        },
        MyModule2: { handlerWithQuery },
      },
    });

    it('Should return tools', async () => {
      assert.equal(tools.length, 4);
      assert.deepStrictEqual(Object.keys(toolsByName), [
        'MyModule1_handlerWithBody',
        'MyModule1_handlerWithToolDescription',
        'customToolName',
        'MyModule2_handlerWithQuery',
      ]);
    });

    it('Should validate input', async () => {
      const tool = toolsByName['MyModule1_handlerWithBody'];
      let result = await tool.execute({ body: { foo: 'foo1' } });
      assert.deepStrictEqual(result, { foo: 'foo1', inputMeta: 'hello' });
      result = await tool.execute({ body: { foo: 'foo1long' } });
      assert.ok(result instanceof HttpException);
    });

    it('Should use proper description', async () => {
      assert.strictEqual(toolsByName['MyModule1_handlerWithBody'].description, 'handlerWithBody description');
      assert.strictEqual(
        toolsByName['MyModule1_handlerWithToolDescription'].description,
        'handlerWithToolDescription x-tool-description'
      );
    });
  });

  describe('MCP', () => {
    const { toolsByName } = createLLMTools({
      meta: { inputMeta: 'hello' },
      resultFormatter: 'mcp',
      modules: {
        MyModule1: { handlerWithBody },
      },
    });

    it('Should validate input', async () => {
      const tool = toolsByName['MyModule1_handlerWithBody'];
      let result: {
        content: {
          type: 'text';
          text: string;
        }[];
      } = await tool.execute({ body: { foo: 'foo1' } });
      assert.deepStrictEqual(result, {
        content: [
          {
            type: 'text',
            text: `Tool executed successfully.\n\nResult:\n${JSON.stringify({ foo: 'foo1', inputMeta: 'hello' }, null, 2)}`,
          },
        ],
      });
      result = await tool.execute({ body: { foo: 'foo1long' } });
      assert.ok(
        result.content[0].text.startsWith('An error occurred while executing the tool.\n\nError:\n'),
        'Expected error message to be present'
      );
    });
  });

  describe('MCP with attributes', () => {
    const handlerWithAttributes = withZod({
      operationObject: {
        description: 'handlerWithAttributes description',
        'x-tool-successMessage': 'Custom success message.',
        'x-tool-errorMessage': 'Custom error message.',
        'x-tool-includeResponse': false,
      },
      body: z.object({ foo: z.string().max(5) }),
      async handle({ vovk }) {
        const { foo } = await vovk.body();
        const { inputMeta } = vovk.meta<{ inputMeta?: string }>();
        return { foo, inputMeta };
      },
    });
    const { toolsByName } = createLLMTools({
      meta: { inputMeta: 'hello' },
      resultFormatter: 'mcp',
      modules: {
        MyModule1: { handlerWithAttributes },
      },
    });

    it('Should validate input', async () => {
      const tool = toolsByName['MyModule1_handlerWithAttributes'];
      let result: {
        content: {
          type: 'text';
          text: string;
        }[];
      } = await tool.execute({ body: { foo: 'foo1' } });
      assert.deepStrictEqual(result, {
        content: [
          {
            type: 'text',
            text: `Custom success message.`,
          },
        ],
      });
      result = await tool.execute({ body: { foo: 'foo1long' } });
      assert.ok(result.content[0].text.startsWith('Custom error message.'), 'Expected error message to be present');
    });
  });
});
