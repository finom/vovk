import { HttpException, HttpStatus, post, prefix, operation, type VovkRequest } from 'vovk';
import {
  streamText,
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream,
  isTextUIPart,
  safeValidateUIMessages,
  type UIMessage,
} from 'ai';
import { openai } from '@ai-sdk/openai';

const LIMIT = 5;
const MAX_MESSAGES = 20;
const MAX_LENGTH = 10_000;

@prefix('ai-sdk')
export default class AiSdkController {
  @operation({
    summary: 'Vercel AI SDK',
    description:
      'Uses [@ai-sdk/openai](https://www.npmjs.com/package/@ai-sdk/openai) and ai packages to chat with an AI model',
  })
  @post('chat')
  static async chat(req: VovkRequest<{ messages: UIMessage[] }>) {
    const validation = await safeValidateUIMessages({ messages: (await req.json()).messages });

    if (!validation.success) {
      throw new HttpException(HttpStatus.BAD_REQUEST, 'Invalid messages');
    }

    // the model gets the text of each message; reasoning, files, tool calls and provider data stay out
    const messages = validation.data.map(({ id, role, parts }) => {
      const text = parts
        .filter(isTextUIPart)
        .map((part) => part.text)
        .join('');
      return { id, role, parts: text ? [{ type: 'text' as const, text }] : [] };
    });

    if (messages.some(({ role }) => role !== 'user' && role !== 'assistant')) {
      throw new HttpException(HttpStatus.BAD_REQUEST, 'Only user and assistant messages are accepted');
    }

    if (messages.length > MAX_MESSAGES || messages.filter(({ role }) => role === 'user').length > LIMIT) {
      throw new HttpException(HttpStatus.BAD_REQUEST, `You can only send ${LIMIT} messages at a time`);
    }

    if (messages.some(({ parts }) => parts.some(({ text }) => text.length > MAX_LENGTH))) {
      throw new HttpException(HttpStatus.BAD_REQUEST, `A message can be ${MAX_LENGTH} characters at most`);
    }

    const result = streamText({
      model: openai('gpt-5-nano'),
      system: 'You are a helpful assistant.',
      messages: await convertToModelMessages(messages),
    });

    return createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream }) });
  }
}
