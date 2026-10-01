'use client';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type ToolUIPart } from 'ai';
import {
  Bot,
  CornerDownLeft,
  MessageSquare,
  MoveDownRight,
} from 'lucide-react';
import { useState } from 'react';
import { AiSdkRPC } from '@/client';
import { CodeBlock } from '@/components/ai-elements/code-block';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import { Response } from '@/components/ai-elements/response';
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from '@/components/ai-elements/tool';
import { Button } from '@/components/ui/button';
import { ChatInput } from '@/components/ui/chat-input';
import {
  ExpandableChat,
  ExpandableChatBody,
  ExpandableChatFooter,
  ExpandableChatHeader,
} from '@/components/ui/expandable-chat';
import useParseSDKToolCallOutputs from '@/hooks/use-parse-sdk-tool-call-outputs';

export function ExpandableChatDemo() {
  const [input, setInput] = useState('');

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: AiSdkRPC.functionCalling.getURL(), // or "/api/ai-sdk/function-calling",
    }),
    onToolCall: (toolCall) => {
      console.log('Tool call initiated:', toolCall);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput('');
    }
  };

  useParseSDKToolCallOutputs(messages);

  return (
    <div className="h-[600px] relative">
      <ExpandableChat
        size="lg"
        position="bottom-right"
        icon={
          <div>
            <div className="absolute text-red-600 -left-15 -top-12 rotate-315 text-lg text-semibold">
              Text AI
            </div>
            <MoveDownRight className="absolute text-red-600 scale-200 -left-4 -top-4" />
            <Bot className="h-6 w-6 scale-150" />
          </div>
        }
      >
        <ExpandableChatHeader className="flex-col text-center justify-center">
          <h1 className="text-xl font-semibold">Realtime Kanban Chat ✨</h1>
          <p className="text-sm text-muted-foreground">
            Tell it what you want to do: create user, assign tasks, etc.
          </p>
        </ExpandableChatHeader>
        <ExpandableChatBody>
          <Conversation className="relative w-full" style={{ height: '500px' }}>
            <ConversationContent>
              {messages.length === 0 ? (
                <ConversationEmptyState
                  icon={<MessageSquare className="size-12" />}
                  title="No messages yet"
                  description="Start a conversation to see messages here"
                />
              ) : (
                messages.map((message) => (
                  <Message from={message.role} key={message.id}>
                    <MessageContent>
                      {message.parts.map((part, i) => {
                        switch (part.type) {
                          case 'text':
                            return (
                              <Response key={`${message.id}-${i}`}>
                                {part.text}
                              </Response>
                            );
                          case 'reasoning':
                            return (
                              <Reasoning
                                key={`${message.id}-${i}`}
                                className="w-full"
                                isStreaming={
                                  status === 'streaming' &&
                                  i === message.parts.length - 1 &&
                                  message.id === messages.at(-1)?.id
                                }
                              >
                                <ReasoningTrigger />
                                <ReasoningContent>{part.text}</ReasoningContent>
                              </Reasoning>
                            );
                          default:
                            if (part.type.startsWith('tool-')) {
                              const toolPart = part as ToolUIPart;
                              return (
                                <Tool
                                  defaultOpen={false}
                                  key={`${message.id}-${i}`}
                                >
                                  <ToolHeader
                                    type={toolPart.type}
                                    state={toolPart.state}
                                  />
                                  <ToolContent>
                                    <ToolInput input={toolPart.input} />
                                    <ToolOutput
                                      output={
                                        <CodeBlock
                                          code={JSON.stringify(
                                            toolPart.output,
                                            null,
                                            2,
                                          )}
                                          language="json"
                                        />
                                      }
                                      errorText={toolPart.errorText}
                                    />
                                  </ToolContent>
                                </Tool>
                              );
                            }
                            return null;
                        }
                      })}
                    </MessageContent>
                  </Message>
                ))
              )}
            </ConversationContent>
          </Conversation>
        </ExpandableChatBody>
        <ExpandableChatFooter>
          <form
            onSubmit={handleSubmit}
            className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1"
          >
            <ChatInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Type your message..."
              className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
            />
            <div className="flex items-center p-3 pt-0 justify-between">
              <Button type="submit" size="sm" className="ml-auto gap-1.5">
                Send Message
                <CornerDownLeft className="size-3.5" />
              </Button>
            </div>
          </form>
        </ExpandableChatFooter>
      </ExpandableChat>
    </div>
  );
}
