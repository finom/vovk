import type { StreamAbortMessage } from './types';
import './utils/shim';

export class JSONLinesResponse<T> extends Response {
  public isClosed = false;

  public controller?: ReadableStreamDefaultController | null;

  public readonly encoder: TextEncoder | null;

  public readonly readableStream: ReadableStream | null;

  private iteratorQueue: Array<T | StreamAbortMessage> = [];
  private iteratorResolvers: Array<(value: IteratorResult<T | StreamAbortMessage>) => void> = [];

  constructor(request?: Request, init?: ResponseInit) {
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

    const accept = request?.headers?.get('accept');

    super(readableStream, {
      ...init,
      headers: {
        'content-type':
          !request || accept?.includes('application/jsonl')
            ? 'application/jsonl; charset=utf-8'
            : 'text/plain; charset=utf-8',
        ...init?.headers,
      },
    });

    this.readableStream = request ? readableStream : null;
    this.encoder = request ? encoder : null;
    this.controller = request ? readableController! : null;

    request?.signal?.addEventListener('abort', this.close, { once: true });

    // this will make promise on the client-side to resolve immediately
    this.controller?.enqueue(encoder?.encode(''));
  }

  public send = (data: T | StreamAbortMessage) => {
    const { controller, encoder } = this;
    if (this.isClosed) return;

    // Enqueue to the ReadableStream
    controller?.enqueue(encoder?.encode(JSON.stringify(data) + '\n'));

    // Handle async iterator consumers
    if (this.iteratorResolvers.length > 0) {
      // If there's a pending next() call, resolve it immediately
      const resolve = this.iteratorResolvers.shift()!;
      resolve({ value: data, done: false });
    } else {
      // Otherwise, queue the value for later consumption
      this.iteratorQueue.push(data);
    }
  };

  public close = () => {
    const { controller } = this;
    if (this.isClosed) return;
    this.isClosed = true;
    controller?.close();

    // Resolve all pending iterator next() calls with done: true
    while (this.iteratorResolvers.length > 0) {
      const resolve = this.iteratorResolvers.shift()!;
      resolve({ done: true, value: undefined });
    }
  };

  public throw = (e: unknown) => {
    this.send({ isError: true, reason: e instanceof Error ? e.message : (e as unknown) });
    return this.close();
  };

  public [Symbol.dispose] = () => this.close();

  public [Symbol.asyncDispose] = () => this.close();

  public [Symbol.asyncIterator] = () => {
    return {
      next: async (): Promise<IteratorResult<T | StreamAbortMessage>> => {
        // If we have queued values, return them immediately
        if (this.iteratorQueue.length > 0) {
          const value = this.iteratorQueue.shift()!;
          return { value, done: false };
        }

        // If the stream is closed and no more values, we're done
        if (this.isClosed) {
          return { done: true, value: undefined };
        }

        // Otherwise, wait for the next value or close
        return new Promise<IteratorResult<T | StreamAbortMessage>>((resolve) => {
          this.iteratorResolvers.push(resolve);
        });
      },
    };
  };
}
