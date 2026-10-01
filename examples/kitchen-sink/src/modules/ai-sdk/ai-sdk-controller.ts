import { HttpException, HttpStatus, post, prefix, operation, type VovkRequest } from 'vovk';
import {
  streamText,
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream,
  type UIMessage,
} from 'ai';
import { openai } from '@ai-sdk/openai';

@prefix('ai-sdk')
export default class AiSdkController {
  @operation({
    summary: 'Vercel AI SDK',
    description:
      'Uses [@ai-sdk/openai](https://www.npmjs.com/package/@ai-sdk/openai) and ai packages to chat with an AI model',
  })
  @post('chat')
  static async chat(req: VovkRequest<{ messages: UIMessage[] }>) {
    const { messages } = await req.json();
    const LIMIT = 5;

    if (messages.filter(({ role }) => role === 'user').length > LIMIT) {
      throw new HttpException(HttpStatus.BAD_REQUEST, `You can only send ${LIMIT} messages at a time`);
    }

    const result = streamText({
      model: openai('gpt-5-nano'),
      system: 'You are a helpful assistant.',
      messages: await convertToModelMessages(messages),
    });

    return createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream }) });
  }
}
