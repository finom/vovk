import assert from 'node:assert';
import { describe, it } from 'node:test';
import {
  decorate,
  deriveTools,
  get,
  HttpException,
  initSegment,
  JSONLinesResponder,
  operation,
  procedure,
  put,
  ToModelOutput,
  toDownloadResponse,
  type VovkOutput,
} from 'vovk';
import { createRPC } from 'vovk/create-rpc';
import type { MCPModelOutput, StandardToolV0 } from 'vovk/internal';
import { z } from 'zod';

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
  }).handle(async ({ vovk }) => {
    const { foo } = await vovk.body();
    const { inputMeta } = vovk.meta<{ inputMeta?: string }>();
    return { foo, inputMeta } satisfies VovkOutput<typeof procedureWithBody>;
  });

  describe('Common tests, implicit default toFormatOutput', () => {
    const procedureWithQuery = procedure({
      operationObject: {
        description: 'procedureWithQuery description',
      },
      query: querySchema,
    }).handle(async ({ vovk }) => {
      const { bar } = vovk.query();
      const { inputMeta } = vovk.meta<{ inputMeta?: string }>();
      return { bar, inputMeta };
    });
    const procedureWithNoDescription = procedure({
      query: querySchema,
    }).handle(async () => {
      // ...
    });

    const procedureWithExcluded = procedure({
      operationObject: {
        'x-tool': { hidden: true },
      },
      query: querySchema,
    }).handle(async () => {
      // ...
    });

    const procedureWithToolDescription = procedure({
      operationObject: {
        'x-tool': { description: 'procedureWithToolDescription x-tool-description' },
        description: 'procedureWithToolDescription description',
      },
      query: z.object({ bar: z.string().max(5) }),
    }).handle(async () => {
      // ...
    });

    const procedureWithToolName = procedure({
      operationObject: {
        'x-tool': { name: 'customToolName', meta: { customToolMeta: 'hi' } },
      },
      query: z.object({ bar: z.string().max(5) }),
    }).handle(async () => {
      // ...
    });

    const tools = deriveTools({
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

    tools satisfies StandardToolV0<
      {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      },
      unknown,
      unknown
    >[];

    const getTool = (name: string) => {
      const tool = tools.find((tool) => tool.name === name);
      assert.ok(tool, `expected the "${name}" tool to be derived`);
      return tool;
    };

    it('Should return tools', async () => {
      assert.equal(tools.length, 4);
      assert.deepStrictEqual(
        tools.map(({ name }) => name),
        [
          'MyModule_procedureWithBody',
          'MyModule_procedureWithToolDescription',
          'customToolName',
          'MyModule2_procedureWithQuery',
        ]
      );
    });

    it('Should provide outputSchema', async () => {
      const tool = getTool('MyModule_procedureWithBody');
      assert.deepStrictEqual(tool.outputSchema, outputSchema);
    });

    it('Should provide a merged inputSchema (Standard Schema + Standard JSON Schema)', async () => {
      const tool = getTool('MyModule_procedureWithBody');
      assert.ok(tool.inputSchema, 'expected merged inputSchema to be defined');
      assert.strictEqual(tool.inputSchema['~standard'].vendor, 'vovk');
      assert.strictEqual(tool.inputSchema['~standard'].version, 1);
      const okResult = await tool.inputSchema['~standard'].validate({ body: { foo: 'foo1' } });
      assert.deepStrictEqual(okResult, { value: { body: { foo: 'foo1' } } });
      const badResult = (await tool.inputSchema['~standard'].validate({ extra: 'x' })) as {
        issues?: ReadonlyArray<{ message: string; path?: unknown[] }>;
      };
      assert.ok(badResult.issues);
      assert.ok(badResult.issues.length > 0);
    });

    it('Should validate input', async () => {
      const tool = getTool('MyModule_procedureWithBody');
      let result = await tool.execute({ body: { foo: 'foo1' } });
      assert.deepStrictEqual(result, { foo: 'foo1', inputMeta: 'hello' });
      result = await tool.execute({ body: { foo: 'foo1long' } });
      assert.deepStrictEqual(result, {
        error: 'Validation failed. Invalid body: Too big: expected string to have <=5 characters at foo',
      });
    });

    it('Should use proper description', async () => {
      assert.strictEqual(getTool('MyModule_procedureWithBody').description, 'procedureWithBody description');
      assert.strictEqual(
        getTool('MyModule_procedureWithToolDescription').description,
        'procedureWithToolDescription x-tool-description'
      );
    });

    it('Should expose x-tool meta as standard tool meta', async () => {
      assert.deepStrictEqual(getTool('customToolName').meta, { customToolMeta: 'hi' });
      assert.strictEqual(getTool('MyModule_procedureWithBody').meta, undefined);
    });
  });

  describe('Explicit custom toModelOutput', () => {
    const tools = deriveTools({
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

    tools satisfies StandardToolV0<
      {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      },
      unknown,
      { myResult?: unknown; myError?: string }
    >[];

    it('Should validate input', async () => {
      const [tool] = tools;
      let result = await tool.execute({ body: { foo: 'foo1' } });
      assert.deepStrictEqual(result, { myResult: { foo: 'foo1', inputMeta: 'hello' } });
      result = await tool.execute({ body: { foo: 'foo1long' } });
      assert.deepStrictEqual(result, {
        myError: 'Error: Validation failed. Invalid body: Too big: expected string to have <=5 characters at foo',
      });
    });
  });

  describe('Explicit default toModelOutput = ToModelOutput.DEFAULT', () => {
    const tools = deriveTools({
      meta: { inputMeta: 'hello' },
      toModelOutput: ToModelOutput.DEFAULT,
      modules: {
        MyModule: {
          procedureWithBody,
        },
      },
    });

    tools satisfies StandardToolV0<
      {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      },
      unknown,
      unknown
    >[];

    it('Should return tools', async () => {
      assert.equal(tools.length, 1);
      assert.deepStrictEqual(
        tools.map(({ name }) => name),
        ['MyModule_procedureWithBody']
      );
    });

    it('Should validate input', async () => {
      const [tool] = tools;
      let result = await tool.execute({ body: { foo: 'foo1' } });
      assert.deepStrictEqual(result, { foo: 'foo1', inputMeta: 'hello' });
      result = await tool.execute({ body: { foo: 'foo1long' } });
      assert.deepStrictEqual(result, {
        error: 'Validation failed. Invalid body: Too big: expected string to have <=5 characters at foo',
      });
    });
  });

  describe('toModelOutput = ToModelOutput.MCP', () => {
    describe('Common, normal JSON output', () => {
      const tools = deriveTools({
        meta: { inputMeta: 'hello' },
        toModelOutput: ToModelOutput.MCP,
        modules: {
          MyModule: { procedureWithBody },
        },
        onExecute: (result, { name }) => console.log(`${name} executed`, result),
      });

      tools satisfies StandardToolV0<
        {
          body?: unknown;
          query?: unknown;
          params?: unknown;
        },
        unknown,
        MCPModelOutput
      >[];

      it('Should validate input', async () => {
        const [tool] = tools;
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
              text: 'Validation failed. Invalid body: Too big: expected string to have <=5 characters at foo',
            },
          ],
          isError: true,
        });
      });

      it('Should convert arrays to structuredContent with items key', async () => {
        const arrayProcedure = procedure({
          operationObject: {
            description: 'arrayProcedure description',
          },
        }).handle(async () => {
          return ['item1', 'item2', 'item3'];
        });

        const [tool] = deriveTools({
          toModelOutput: ToModelOutput.MCP,
          modules: {
            MyModule: { arrayProcedure },
          },
        });
        const result: MCPModelOutput = await tool.execute({});
        assert.deepStrictEqual(result, {
          content: [
            {
              type: 'text',
              text: JSON.stringify(['item1', 'item2', 'item3']),
            },
          ],
          structuredContent: { items: ['item1', 'item2', 'item3'] },
        });
      });
    });

    describe('Audio Response instance', () => {
      const [withAudioResponseTool] = deriveTools({
        toModelOutput: ToModelOutput.MCP,
        modules: {
          MyModule: {
            withAudioResponse: procedure({
              operationObject: {
                summary: 'Returns an audio response',
                'x-tool': { name: 'withAudioResponse' },
              },
            }).handle(async () => {
              return toDownloadResponse(new Uint8Array([1, 2, 3, 4, 5]).buffer, {
                type: 'audio/wav',
                filename: 'test.wav',
              });
            }),
          },
        },
      });

      it('Should return audio output', async () => {
        const result: MCPModelOutput = await withAudioResponseTool.execute({});
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
      const [withImageResponseTool] = deriveTools({
        toModelOutput: ToModelOutput.MCP,
        modules: {
          MyModule: {
            withImageResponse: procedure({
              operationObject: {
                summary: 'Returns an image response',
                'x-tool': { name: 'withImageResponse' },
              },
            }).handle(async () => {
              return toDownloadResponse(
                Uint8Array.from([
                  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, 0x00,
                  0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x02, 0x08, 0x02, 0x00, 0x00, 0x00, 0xfd, 0xd4, 0x9a, 0x73, 0x00,
                  0x00, 0x00, 0x0e, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00, 0x00, 0x01, 0x01,
                  0x01, 0x00, 0x18, 0xdd, 0x8d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60,
                  0x82,
                ]).buffer,
                {
                  type: 'image/png',
                  filename: 'test.png',
                }
              );
            }),
          },
        },
      });

      it('Should return image output', async () => {
        const result: MCPModelOutput = await withImageResponseTool.execute({});
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
      const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAADklEQVQI12P4z8AAAAEBAQAY3Y20AAAAAElFTkSuQmCC';

      const [withImageResponseTool] = deriveTools({
        toModelOutput: ToModelOutput.MCP,
        modules: {
          MyModule: {
            withImageResponse: procedure({
              operationObject: {
                summary: 'Returns an image response',
                'x-tool': { name: 'withImageResponse' },
              },
            }).handle(async () => {
              return fetch(`data:image/png;base64,${base64}`);
            }),
          },
        },
      });

      it('Should return fetched image output', async () => {
        const result: MCPModelOutput = await withImageResponseTool.execute({});
        assert.deepStrictEqual(result, {
          content: [
            {
              type: 'image',
              mimeType: 'image/png',
              data: base64,
            },
          ],
        });
      });
    });

    describe('CSV Response instance', () => {
      const [withCSVResponseTool] = deriveTools({
        toModelOutput: ToModelOutput.MCP,
        modules: {
          MyModule: {
            withCSVResponse: procedure({
              operationObject: {
                summary: 'Returns a CSV response',
                'x-tool': { name: 'withCSVResponse' },
              },
            }).handle(async () => {
              const csvContent = 'name,age\nAlice,30\nBob,25';
              return toDownloadResponse(csvContent, {
                type: 'text/csv',
                filename: 'test.csv',
              });
            }),
          },
        },
      });

      it('Should return CSV output', async () => {
        const result: MCPModelOutput = await withCSVResponseTool.execute({});
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
      const [withTextResponseTool] = deriveTools({
        toModelOutput: ToModelOutput.MCP,
        modules: {
          MyModule: {
            withTextResponse: procedure({
              operationObject: {
                summary: 'Returns a text response',
                'x-tool': { name: 'withTextResponse' },
              },
            }).handle(async () => {
              return new Response('Hello, this is a text response.', {
                headers: { 'Content-Type': 'text/plain' },
              });
            }),
          },
        },
      });

      it('Should return text output', async () => {
        const result: MCPModelOutput = await withTextResponseTool.execute({});
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
      const [withJSONResponseTool] = deriveTools({
        toModelOutput: ToModelOutput.MCP,
        modules: {
          MyModule: {
            withJSONResponse: procedure({
              operationObject: {
                summary: 'Returns a JSON response',
                'x-tool': { name: 'withJSONResponse' },
              },
            }).handle(async () => {
              return new Response(JSON.stringify({ message: 'Hello, this is a JSON response.' }), {
                headers: { 'Content-Type': 'application/json' },
              });
            }),
          },
        },
      });

      it('Should return JSON MCPModelOutput', async () => {
        const result: MCPModelOutput = await withJSONResponseTool.execute({});
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
      }).handle(async ({ vovk }) => {
        const { foo } = await vovk.body();
        vovk.meta({ mcpOutput: { annotations: { audience: ['user'], priority: 5 } } });

        return { foo };
      });

      const [procedureWithAnnotationsTool] = deriveTools({
        toModelOutput: ToModelOutput.MCP,
        modules: {
          MyModule: {
            procedureWithAnnotations,
          },
        },
      });

      const result: MCPModelOutput = await procedureWithAnnotationsTool.execute({ body: { foo: 'bar' } });
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

  describe('Default formatter with Response and generator results', () => {
    const returnsJSONResponse = procedure({ operationObject: { description: 'd' } }).handle(async () =>
      Response.json({ ok: true })
    );
    const returnsTextResponse = procedure({ operationObject: { description: 'd' } }).handle(async () =>
      toDownloadResponse('a,b\n1,2', { type: 'text/csv', filename: 'a.csv' })
    );
    const returnsBinaryResponse = procedure({ operationObject: { description: 'd' } }).handle(async () =>
      toDownloadResponse(new Uint8Array([1, 2, 3]), { type: 'image/png', filename: 'a.png' })
    );
    const returnsGenerator = procedure({ operationObject: { description: 'd' } }).handle(async function* () {
      yield { n: 1 };
      yield { n: 2 };
    });

    const [jsonTool, textTool, binaryTool, generatorTool] = deriveTools({
      modules: { MyModule: { returnsJSONResponse, returnsTextResponse, returnsBinaryResponse, returnsGenerator } },
    });

    it('Parses a JSON Response instead of handing over the Response object', async () => {
      assert.deepStrictEqual(await jsonTool.execute({}), { ok: true });
    });

    it('Reads a text Response as a string', async () => {
      assert.deepStrictEqual(await textTool.execute({}), 'a,b\n1,2');
    });

    it('Encodes a binary Response', async () => {
      assert.deepStrictEqual(await binaryTool.execute({}), { mimeType: 'image/png', data: 'AQID' });
    });

    it('Collects the items of a generator handler', async () => {
      assert.deepStrictEqual(await generatorTool.execute({}), [{ n: 1 }, { n: 2 }]);
    });
  });

  describe('Tool names', () => {
    const returnsOne = procedure({ operationObject: { description: 'd' } }).handle(async () => 1);

    it('Replaces the characters a model API refuses', () => {
      const [tool] = deriveTools({ modules: { $Store: { $get: returnsOne } } });

      assert.strictEqual(tool.name, '_Store__get');
    });

    it('Cuts a name to 64 characters, ending with a hash of the whole name', () => {
      const moduleName = 'AdministrationBackOfficeControllerForTheInternalTeamRPC';
      const [first, second] = deriveTools({
        modules: { [moduleName]: { getUsersWithTheirRoles: returnsOne, getUsersWithTheirGroups: returnsOne } },
      }).map(({ name }) => name);

      assert.strictEqual(first.length, 64);
      assert.match(first, /^AdministrationBackOfficeControllerForTheInternalTeamRPC_[0-9a-f]{8}$/);
      assert.notStrictEqual(first, second);
    });

    it('Throws when two tools get the same name', () => {
      assert.throws(
        () => deriveTools({ modules: { A_B: { c: returnsOne }, A: { B_c: returnsOne } } }),
        /"A_B_c".*A_B\.c.*A\.B_c/
      );
    });
  });

  describe('Error responses', () => {
    const notFound = procedure({ operationObject: { description: 'd' } }).handle(async () =>
      Response.json({ message: 'User not found' }, { status: 404 })
    );
    const forbidden = procedure({ operationObject: { description: 'd' } }).handle(
      async () => new Response('Forbidden', { status: 403 })
    );

    it('Gives the model the error of an error status and calls onError', async () => {
      const calls: string[] = [];
      const [notFoundTool, forbiddenTool] = deriveTools({
        modules: { MyModule: { notFound, forbidden } },
        onExecute: () => calls.push('onExecute'),
        onError: (error) => {
          assert.ok(error instanceof HttpException);
          calls.push(`onError ${error.statusCode} ${error.message}`);
        },
      });

      assert.deepStrictEqual(await notFoundTool.execute({}), { error: 'User not found' });
      assert.deepStrictEqual(await forbiddenTool.execute({}), { error: 'Forbidden' });
      assert.deepStrictEqual(calls, ['onError 404 User not found', 'onError 403 Forbidden']);
    });

    it('Marks the MCP output of an error status as an error and calls onError', async () => {
      const calls: string[] = [];
      const [tool] = deriveTools({
        modules: { MyModule: { notFound } },
        toModelOutput: ToModelOutput.MCP,
        onExecute: () => calls.push('onExecute'),
        onError: () => calls.push('onError'),
      });

      assert.deepStrictEqual(await tool.execute({}), {
        content: [{ type: 'text', text: '{"message":"User not found"}' }],
        isError: true,
      });
      assert.deepStrictEqual(calls, ['onError']);
    });
  });

  describe('JSONLinesResponder results', () => {
    const returnsResponder = procedure({ operationObject: { description: 'd' } }).handle(async (req) => {
      const responder = new JSONLinesResponder<{ n: number }>(req);
      void (async () => {
        await responder.send({ n: 1 });
        await responder.send({ n: 2 });
        await responder.close();
      })();
      return responder;
    });

    const failingResponder = procedure({ operationObject: { description: 'd' } }).handle(async (req) => {
      const responder = new JSONLinesResponder<{ n: number }>(req);
      void (async () => {
        await responder.send({ n: 1 });
        responder.throw(new Error('stream broke'));
      })();
      return responder;
    });

    it('Collects the lines a responder sends', async () => {
      const [tool] = deriveTools({ modules: { MyModule: { returnsResponder } } });

      assert.deepStrictEqual(await tool.execute({}), [{ n: 1 }, { n: 2 }]);
    });

    it('Gives the MCP formatter the lines', async () => {
      const [tool] = deriveTools({ modules: { MyModule: { returnsResponder } }, toModelOutput: ToModelOutput.MCP });

      assert.deepStrictEqual(await tool.execute({}), {
        content: [{ type: 'text', text: '[{"n":1},{"n":2}]' }],
        structuredContent: { items: [{ n: 1 }, { n: 2 }] },
      });
    });

    it('Reports the error a responder throws', async () => {
      const errors: string[] = [];
      const [tool] = deriveTools({
        modules: { MyModule: { failingResponder } },
        onError: (error) => errors.push(error.message),
      });

      assert.deepStrictEqual(await tool.execute({}), { error: 'stream broke' });
      assert.deepStrictEqual(errors, ['stream broke']);
    });
  });

  describe('onExecute and onError', () => {
    const throwingProcedure = procedure({
      operationObject: { description: 'throwingProcedure description' },
    }).handle(async () => {
      throw new Error('handler exploded');
    });

    it('Calls onError with the thrown error and leaves onExecute alone', async () => {
      const calls: [string, string][] = [];
      const [tool] = deriveTools({
        modules: { MyModule: { throwingProcedure } },
        onExecute: (result) => calls.push(['onExecute', JSON.stringify(result)]),
        onError: (error) => calls.push(['onError', error.message]),
      });

      const result = await tool.execute({});

      assert.deepStrictEqual(result, { error: 'handler exploded' });
      assert.deepStrictEqual(calls, [['onError', 'handler exploded']]);
    });

    it('Calls onError when input validation fails', async () => {
      const calls: string[] = [];
      const [tool] = deriveTools({
        modules: { MyModule: { procedureWithBody } },
        onExecute: () => calls.push('onExecute'),
        onError: () => calls.push('onError'),
      });

      await tool.execute({ body: { foo: 'foo1long' } });

      assert.deepStrictEqual(calls, ['onError']);
    });

    it('Calls onExecute on success', async () => {
      const calls: string[] = [];
      const [tool] = deriveTools({
        modules: { MyModule: { procedureWithBody } },
        onExecute: () => calls.push('onExecute'),
        onError: () => calls.push('onError'),
      });

      await tool.execute({ body: { foo: 'ok' } });

      assert.deepStrictEqual(calls, ['onExecute']);
    });
  });

  describe('Input', () => {
    it('Runs a tool without input when execute gets undefined', async () => {
      const calls: string[] = [];
      const noInput = procedure({ operationObject: { description: 'd' } }).handle(async () => ({ ok: true }));
      const [tool] = deriveTools({
        modules: { MyModule: { noInput } },
        onExecute: () => calls.push('onExecute'),
        onError: () => calls.push('onError'),
      });

      assert.deepStrictEqual(await tool.execute(undefined as never), { ok: true });
      assert.deepStrictEqual(calls, ['onExecute']);
    });
  });

  describe('meta and OpenAPI mixins', () => {
    const segment = (segmentType: string, forceApiRoot?: string) => ({
      segmentName: 'external',
      segmentType,
      emitSchema: true,
      forceApiRoot,
      controllers: {
        ReposAPI: {
          rpcModuleName: 'ReposAPI',
          prefix: '',
          handlers: {
            getRepo: { path: 'repos/{repo}', httpMethod: 'GET', operationObject: { summary: 'Get a repo' } },
          },
        },
      },
    });

    const sentMeta = async (segmentType: string, forceApiRoot?: string) => {
      const schema = { segments: { external: segment(segmentType, forceApiRoot) } };
      const ReposAPI = (createRPC as (...args: unknown[]) => Record<string, unknown>)(schema, 'external', 'ReposAPI');
      const [tool] = deriveTools({ modules: { ReposAPI }, meta: { sessionToken: 'secret' } });
      const original = globalThis.fetch;
      const headers: (string | null)[] = [];
      globalThis.fetch = (async (_url: string, init: RequestInit) => {
        headers.push(new Headers(init.headers).get('x-meta'));
        return Response.json({ id: 1 });
      }) as typeof fetch;
      try {
        await tool.execute({ params: { repo: 'vovk' } });
      } finally {
        globalThis.fetch = original;
      }
      return headers;
    };

    it('Sends meta to an RPC module of the app', async () => {
      assert.deepStrictEqual(await sentMeta('segment'), ['{"sessionToken":"secret"}']);
    });

    it("Doesn't send meta to a mixin, whose host is a third party", async () => {
      assert.deepStrictEqual(await sentMeta('mixin', 'https://api.example.com'), [null]);
    });
  });

  describe('Custom Result Formatter', () => {
    const tools = deriveTools({
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

    tools satisfies StandardToolV0<
      {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      },
      unknown,
      { myResult?: unknown; myError?: string }
    >[];

    it('Should validate input', async () => {
      const [tool] = tools;
      let result = await tool.execute({ body: { foo: 'foo1' } });
      assert.deepStrictEqual(result, { myResult: { foo: 'foo1', inputMeta: 'hello' } });
      result = await tool.execute({ body: { foo: 'foo1long' } });
      assert.deepStrictEqual(result, {
        myError: 'Error: Validation failed. Invalid body: Too big: expected string to have <=5 characters at foo',
      });
    });
  });

  describe('Merged inputSchema (Standard Schema + Standard JSON Schema)', () => {
    const paramsSchema = z.object({ baz: z.string().max(5) });
    const procedureWithNoSlots = procedure({
      operationObject: { description: 'procedureWithNoSlots description' },
    }).handle(async () => ({ ok: true }));
    const procedureWithAllSlots = procedure({
      operationObject: { description: 'procedureWithAllSlots description' },
      body: bodySchema,
      query: querySchema,
      params: paramsSchema,
    }).handle(async () => ({ ok: true }));

    const tools = deriveTools({
      modules: {
        MyModule: { procedureWithNoSlots, procedureWithAllSlots },
      },
    });

    const getTool = (name: string) => {
      const tool = tools.find((tool) => tool.name === name);
      assert.ok(tool, `expected the "${name}" tool to be derived`);
      return tool;
    };

    it('Should leave inputSchema undefined when the procedure has no body/query/params', () => {
      const tool = getTool('MyModule_procedureWithNoSlots');
      assert.strictEqual(tool.inputSchema, undefined);
    });

    it('Merged inputSchema produces the expected JSON Schema envelope', () => {
      const tool = getTool('MyModule_procedureWithAllSlots');
      assert.ok(tool.inputSchema);
      const jsonSchema = tool.inputSchema['~standard'].jsonSchema.input({ target: 'draft-2020-12' });
      assert.strictEqual(jsonSchema.type, 'object');
      assert.strictEqual(jsonSchema.additionalProperties, false);
      assert.deepStrictEqual(jsonSchema.required, ['body', 'query', 'params']);
      const properties = jsonSchema.properties as Record<string, Record<string, unknown>>;
      assert.ok(properties.body);
      assert.ok(properties.query);
      assert.ok(properties.params);
    });

    it('Merged inputSchema validates all three slots together', async () => {
      const tool = getTool('MyModule_procedureWithAllSlots');
      assert.ok(tool.inputSchema);
      const okResult = await tool.inputSchema['~standard'].validate({
        body: { foo: 'a' },
        query: { bar: 'b' },
        params: { baz: 'c' },
      });
      assert.deepStrictEqual(okResult, {
        value: { body: { foo: 'a' }, query: { bar: 'b' }, params: { baz: 'c' } },
      });
      const missingResult = (await tool.inputSchema['~standard'].validate({ body: { foo: 'a' } })) as {
        issues?: ReadonlyArray<{ message: string; path?: unknown[] }>;
      };
      assert.ok(missingResult.issues);
      const missingKeys = missingResult.issues
        .filter((i) => i.message === 'Required')
        .map((i) => (i.path?.[0] as { key?: string } | undefined)?.key);
      assert.ok(missingKeys.includes('query'));
      assert.ok(missingKeys.includes('params'));
    });
  });

  describe('Controllers with operation() applied before the HTTP decorator', () => {
    class UserController {
      static prefix = 'users';

      // the decorate() sample of the docs: the HTTP decorator listed first is applied last
      static updateUser = decorate(
        put('{id}'),
        operation({ summary: 'Update user' }),
        procedure({ params: z.object({ id: z.string() }), body: z.object({ email: z.string() }) })
      ).handle(async (req, { id }) => ({ id, ...(await req.vovk.body()) }));

      static getUser = procedure({ params: z.object({ id: z.string() }) }).handle(async (_req, { id }) => ({ id }));
    }
    // @get('{id}') written above @operation()
    operation({ summary: 'Get user' })(UserController, 'getUser');
    get('{id}')(UserController, 'getUser');
    initSegment({ segmentName: 'derive-tools', controllers: { UserRPC: UserController } });

    it('Derives their tools', () => {
      assert.deepStrictEqual(
        deriveTools({ modules: { UserController } }).map(({ name }) => name),
        ['UserController_updateUser', 'UserController_getUser']
      );
    });

    it('Gives the method the schema of its RPC method', () => {
      const { path, httpMethod, operationObject } = UserController.updateUser.schema;

      assert.deepStrictEqual(
        { path, httpMethod, summary: operationObject?.summary },
        { path: '{id}', httpMethod: 'PUT', summary: 'Update user' }
      );
    });
  });
});
