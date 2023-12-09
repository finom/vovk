/**
await controller.postWithStreaming({ body }).onMessage((message) => {}))
 */

import { type _DefaultFetcherOptions as DefaultFetcherOptions } from './defaultFetcher';
import { _HttpStatus as HttpStatus, type _ErrorResponseBody as ErrorResponseBody } from '../types';
import { type _SmoothieClientFetcher as SmoothieClientFetcher } from './types';
import { _HttpException as HttpException } from '../HttpException';
import { _StreamResponse as StreamResponse } from '../StreamResponse';

export const DEFAULT_ERROR_MESSAGE = 'Unknown error at defaultStreamFetcher';

export const _defaultStreamFetcher: SmoothieClientFetcher<DefaultFetcherOptions> = async (
  { httpMethod, getPath, validate, onStreamMessage, setReader },
  { params, query, body, prefix = '', ...options }
) => {
  const endpoint =
    (prefix.startsWith('http://') || prefix.startsWith('https://') ? '' : '/') +
    (prefix.endsWith('/') ? prefix : `${prefix}/`) +
    getPath(params, query);

  if (!onStreamMessage) throw new Error('onMessage is not provided at defaultStreamFetcher');

  try {
    validate({ body, query });
  } catch (e) {
    // if HttpException is thrown, rethrow it
    if (e instanceof HttpException) throw e;
    // otherwise, throw HttpException with status 0
    throw new HttpException(HttpStatus.NULL, (e as Error).message ?? DEFAULT_ERROR_MESSAGE);
  }

  const init: RequestInit = {
    method: httpMethod,
    ...options,
  };

  if (body instanceof FormData) {
    init.body = body as BodyInit;
  } else if (body) {
    init.body = JSON.stringify(body);
  }

  let response: Response;

  try {
    response = await fetch(endpoint, init);
  } catch (e) {
    // handle network errors
    throw new HttpException(HttpStatus.NULL, (e as Error).message ?? DEFAULT_ERROR_MESSAGE);
  }

  if (!response.ok) {
    let result: unknown;
    try {
      result = await response.json();
    } catch {
      // ignore parsing errors
    }
    // handle server errors
    throw new HttpException(response.status, (result as ErrorResponseBody).message ?? DEFAULT_ERROR_MESSAGE);
  }

  if (!response.body) throw new HttpException(HttpStatus.NULL, 'Stream body is falsy. Check your controller code.');

  const reader = response.body.getReader();

  setReader?.(reader);

  const messages: unknown[] = [];

  // eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
  const promise = new Promise(async (resolve, reject) => {
    let prepend = '';
    let upcomingError: unknown;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      let value: Uint8Array | undefined;
      let done = false;

      try {
        ({ value, done } = await reader.read());
      } catch (error) {
        if (upcomingError) {
          if (typeof upcomingError === 'string') {
            return reject(new Error(upcomingError));
          }
          return reject(upcomingError);
        }
        return reject(new Error('Stream error. ' + String(error)));
      }

      if (done) {
        resolve(messages);
        break;
      }

      const string = new TextDecoder().decode(value);
      const lines = (prepend + string).split(StreamResponse.JSON_DIVIDER).filter(Boolean);
      for (const line of lines) {
        let data;
        try {
          data = JSON.parse(line) as object;
          prepend = '';
        } catch (error) {
          // 'Error parsing JSON. Runnig prepend workaround.
          prepend += string;
          break;
        }

        if (data) {
          if ('isError' in data && 'reason' in data) {
            upcomingError = data.reason;
          } else {
            messages.push(data);
            onStreamMessage(data);
          }
        }
      }
    }
  });

  // Promise should have reader property to be able to cancel the stream
  (promise as unknown as { reader: ReadableStreamDefaultReader<Uint8Array> }).reader = reader;

  return promise;
};

/* 

 readonly createChatMessage = async (
    id: ChatSession['id'],
    { content, requestInitialMessage }: { content?: string; requestInitialMessage?: boolean }
  ) => {
    if (!id) {
      throw new Error('Current chat session is not set');
    }

    const endpoint = `/chat-sessions/${id}/chat-messages`;

    const response = await window.fetch(process.env.NEXT_PUBLIC_API_URL + endpoint, {
      headers: { Authorization: 'Bearer ' + (await this.#store.auth.getAccessToken()) },
      method: 'POST',
      body: JSON.stringify({ content, requestInitialMessage }),
    });

    const reader = response.body?.getReader();

    if (reader) {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
      return new Promise(async (resolve) => {
        let prepend = '';
        // eslint-disable-next-line no-constant-condition
        while (true) {
          let value: Uint8Array | undefined;
          let done = false;

          try {
            ({ value, done } = await reader.read());
          } catch (error) {
            this.#store.app.errorToast('Stream error. Please try again.');
            break;
          }

          if (done) {
            console.log('Stream done');
            resolve(true);
            break;
          }

          const string = new TextDecoder().decode(value);
          const lines = (prepend + string).split('____####1234567890_JSON_DIVIDER####____').filter(Boolean);
          for (const line of lines) {
            let data;
            try {
              data = JSON.parse(line) as ChatSessionStreamResponse;
              prepend = '';
            } catch (error) {
              prepend += string;
              console.error('Error parsing JSON. Runnig prepend workaround.', error);

              break;
            }

            if (data) {
              if (data.event === ChatSessionStreamEvent.NEW_CHAT_MESSAGE) {
                const message = data.payload.message;
                this.#store.chatSessions.data[id] = {
                  ...this.#store.chatSessions.data[id],
                  chatMessages: [
                    ...(this.#store.chatSessions.data[id].chatMessages ?? []),
                    parseApiResult(this.#store, message),
                  ],
                };

                this.data[message.id] = {
                  ...this.data[message.id],
                  _isDone: false,
                };
              } else if (data.event === ChatSessionStreamEvent.TOKEN) {
                const { content: tokenContent, chatMessageId } = data.payload;
                this.data[chatMessageId] = {
                  ...this.data[chatMessageId],
                  content: (this.data[chatMessageId].content ?? '') + (tokenContent ?? ''),
                };
              } else if (data.event === ChatSessionStreamEvent.SESSION_UPDATE) {
                const { chatSessionName } = data.payload;

                if (chatSessionName) {
                  this.#store.chatSessions.data[id] = {
                    ...this.#store.chatSessions.data[id],
                    chatSessionName,
                  };
                }
              } else if (data.event === ChatSessionStreamEvent.CLOSE) {
                const { userMessageId } = data.payload;
                // when initial message requested but there is no initial message env variable then userMessageId is going to be nullish
                if (userMessageId) {
                  this.data[userMessageId] = {
                    ...this.data[userMessageId],
                    _isDone: true,
                  };
                }
              } else if (data.event === ChatSessionStreamEvent.UPDATE_CHAT_MESSAGE) {
                const { message } = data.payload;
                parseApiResult(this.#store, message);
                this.data[message.id] = {
                  ...this.data[message.id],
                  ...message,
                };
              } else if (data.event === ChatSessionStreamEvent.USER_UPDATE) {
                const { me } = this.#store.users;
                if (!me) continue;
                this.#store.users.data[me] = {
                  ...this.#store.users.data[me],
                  ...data.payload,
                };
              } else if (data.event === ChatSessionStreamEvent.CLIENT_SIGNAL_REQUEST) {
                const { clientEvent, argument } = data.payload;

                const tool: CompletionToolClient | undefined = toolsClient.find(
                  ({ clientSignalEvent }) => clientSignalEvent === clientEvent
                );

                if (tool) {
                  const payload = await tool.clientSignalExecute(argument ?? '{}', { store: this.#store });

                  const signal = {
                    chatSessionId: id,
                    event: clientEvent,
                    payload,
                  };

                  void this.sendSignal(id, signal as ClientSignal);
                }
              }
            }
          }
        }
      });
    }
  };
  */
