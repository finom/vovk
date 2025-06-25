import { headers } from 'next/headers';
import type { KnownAny, StreamAbortMessage } from './types';
import './utils/shim';

export class JSONLinesResponse<T> extends Response {
  public isClosed = false;

  public controller?: ReadableStreamDefaultController;

  public readonly encoder: TextEncoder;

  public readonly readableStream: ReadableStream;

  constructor(requestHeaders: Awaited<ReturnType<typeof headers>>, init?: ResponseInit) {
    const encoder = new TextEncoder();
    let readableController: ReadableStreamDefaultController;

    const readableStream = new ReadableStream({
      cancel: () => {
        this.isClosed = true;
      },
      start: (controller) => {
        readableController = controller;
      },
    });

    if (!requestHeaders) {
      throw new Error('Request headers are required');
    }

    const accept = requestHeaders.get('accept');

    super(readableStream, {
      ...init,
      headers: {
        ...init?.headers,
        'Content-Type': accept?.includes('application/jsonl')
          ? 'application/jsonl; charset=utf-8'
          : 'text/plain; charset=utf-8',
      },
    });

    this.readableStream = readableStream;
    this.encoder = encoder;
    this.controller = readableController!;
  }

  public send(data: T | StreamAbortMessage) {
    const { controller, encoder } = this;
    if (this.isClosed) return;
    this.nextValueResolve(data as T);
    return controller?.enqueue(encoder.encode(JSON.stringify(data) + '\n'));
  }

  public close() {
    const { controller } = this;
    if (this.isClosed) return;
    this.isClosed = true;
    controller?.close();
  }

  public throw(e: KnownAny) {
    this.send({ isError: true, reason: e instanceof Error ? e.message : (e as unknown) });
    this.nextValueReject(e);
    return this.close();
  }

  public [Symbol.dispose]() {
    this.close();
  }

  public [Symbol.asyncDispose]() {
    this.close();
  }

  private nextValueReject: (_e: KnownAny) => void = () => {};

  private nextValueResolve: (value: T) => void = () => {};

  private nextValue() {
    const { resolve, reject, promise } = Promise.withResolvers<T>();

    this.nextValueResolve = resolve;
    this.nextValueReject = reject;
    return promise;
  }

  public [Symbol.asyncIterator]() {
    return {
      next: async () => {
        if (this.isClosed) {
          return { done: true, value: null };
        }
        return { done: false, value: await this.nextValue() };
      },
    };
  }
}
