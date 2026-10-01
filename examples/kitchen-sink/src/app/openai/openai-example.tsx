'use client';
import { useState } from 'react';
import { OpenAiRPC } from '@/client';
import type OpenAI from 'openai';

type Message = OpenAI.Chat.Completions.ChatCompletionMessageParam;

export default function OpenAiExample() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState<Error | null>(null);

  const submit = async () => {
    if (!userInput) return;
    setUserInput('');
    const userMessage: Message = { role: 'user', content: userInput };

    setMessages((messages) => [...messages, userMessage]);

    try {
      using completion = await OpenAiRPC.createChatCompletion({
        body: { messages: [...messages, userMessage] },
      });

      setMessages((mesages) => [...mesages, { role: 'assistant', content: '' } satisfies Message]);

      for await (const chunk of completion) {
        setMessages((messages) => {
          const lastMessage = messages[messages.length - 1];
          return [
            ...messages.slice(0, -1),
            { ...lastMessage, content: lastMessage.content + (chunk.choices[0]?.delta?.content ?? '') },
          ];
        });
      }
    } catch (error) {
      setError(error as Error);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {messages.map((message, index) => (
        <div key={index}>
          {message.role === 'assistant' ? '🤖' : '👤'} {(message.content as string) || '...'}
        </div>
      ))}
      {error && <div>❌ {error.message}</div>}
      <div className="input-group">
        <input
          type="text"
          placeholder="Type a message..."
          value={userInput}
          onChange={(e) => setUserInput(e.currentTarget.value)}
        />
        <button type="submit" disabled={!userInput}>
          Send
        </button>
      </div>
    </form>
  );
}
