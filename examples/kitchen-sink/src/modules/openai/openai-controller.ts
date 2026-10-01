import { type VovkRequest, post, prefix, operation, HttpException, HttpStatus } from 'vovk';
import OpenAI from 'openai';

@prefix('openai')
export default class OpenAiController {
  @operation({
    summary: 'Create a chat completion',
    description: 'Create a chat completion using OpenAI and yield the response',
  })
  @post('chat')
  static async *createChatCompletion(
    req: VovkRequest<{ messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] }>
  ) {
    const { messages } = await req.json();
    const LIMIT = 5;
    const openai = new OpenAI();

    if (messages.filter(({ role }) => role === 'user').length > LIMIT) {
      throw new HttpException(HttpStatus.BAD_REQUEST, `You can only send ${LIMIT} messages at a time`);
    }

    yield* await openai.chat.completions.create({
      messages,
      model: 'gpt-5-nano',
      stream: true,
    });
  }
}
