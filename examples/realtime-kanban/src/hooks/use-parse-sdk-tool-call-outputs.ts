import type { ToolUIPart, UIMessage } from 'ai';
import { useEffect, useRef } from 'react';
import { useRegistryStore } from '@/hooks/use-registry';

export default function useParseSDKToolCallOutputs(messages: UIMessage[]) {
  const store = useRegistryStore();
  const parsedToolCallIdsSetRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const partsToParse = messages.flatMap((msg) =>
      msg.parts.filter((part) => {
        return (
          msg.role === 'assistant' &&
          part.type.startsWith('tool-') &&
          (part as ToolUIPart).state === 'output-available' &&
          'toolCallId' in part &&
          !parsedToolCallIdsSetRef.current.has(part.toolCallId)
        );
      }),
    ) as ToolUIPart[];

    partsToParse.forEach((part) => {
      parsedToolCallIdsSetRef.current.add(part.toolCallId);
    });

    if (partsToParse.length) {
      store.getState().parse(partsToParse.map((part) => part.output));
    }
  }, [messages, store]);
}
