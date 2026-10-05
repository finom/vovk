import { openai } from '@ai-sdk/openai';
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  tool,
  toUIMessageStream,
  type UIMessage,
} from 'ai';
import { z } from 'zod';
import { deriveTools, operation, post, prefix, type VovkRequest } from 'vovk';
import { sessionGuard } from '@/decorators/session-guard';
import TaskController from '../task/task-controller';
import UserController from '../user/user-controller';

@prefix('ai-sdk')
export default class AiSdkController {
  @operation({
    summary: 'Function Calling',
    description:
      'Uses [@ai-sdk/openai](https://www.npmjs.com/package/@ai-sdk/openai) and ai packages to call UserController and TaskController functions based on the provided messages.',
  })
  @post('function-calling')
  @sessionGuard()
  static async functionCalling(req: VovkRequest<{ messages: UIMessage[] }>) {
    const { messages } = await req.json();
    const tools = deriveTools({
      modules: {
        UserController,
        TaskController,
      },
    });

    const toolSet = Object.fromEntries(
      tools.map(({ name, execute, description, inputSchema }) => [
        name,
        tool({
          execute,
          description,
          // the SDK takes Standard Schema as is; a procedure without input has no schema
          inputSchema: inputSchema ?? z.object({}),
        }),
      ]),
    );

    const result = streamText({
      model: openai('gpt-5'),
      instructions: 'You execute functions sequentially, one by one.',
      messages: await convertToModelMessages(messages),
      tools: toolSet,
      stopWhen: stepCountIs(16),
      onError: (e) => console.error('streamText error', e),
      onFinish: ({ finishReason, toolCalls }) => {
        if (finishReason === 'tool-calls') {
          console.log('Tool calls finished', toolCalls);
        }
      },
    });

    // pass toolSet so tool parts keep the dynamic flag the old method set for us
    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream, tools: toolSet }),
    });
  }
}
