import { headers } from 'next/headers';
import type { KnownAny, StreamAbortMessage } from './types.js';
import './utils/shim.js';

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
    return this.close();
  }

  public [Symbol.dispose]() {
    this.close();
  }
}
