import { procedure, post, prefix, operation, HttpException, HttpStatus } from 'vovk';
import OpenAI from 'openai';
import { z } from 'zod';

const LIMIT = 5;

@prefix('openai')
export default class OpenAiController {
  @operation({
    summary: 'Create a chat completion',
    description: 'Create a chat completion using OpenAI and yield the response',
  })
  @post('chat')
  static createChatCompletion = procedure({
    body: z.object({
      messages: z
        .array(
          z.object({
            role: z.enum(['user', 'assistant']),
            content: z.string().max(10_000),
          })
        )
        .max(20),
    }),
  }).handle(async function* (req) {
    const { messages } = await req.vovk.body();

    if (messages.filter(({ role }) => role === 'user').length > LIMIT) {
      throw new HttpException(HttpStatus.BAD_REQUEST, `You can only send ${LIMIT} messages at a time`);
    }

    const openai = new OpenAI();

    yield* await openai.chat.completions.create({
      messages: [{ role: 'developer', content: 'You are a helpful assistant.' }, ...messages],
      model: 'gpt-5-nano',
      stream: true,
    });
  });
}
