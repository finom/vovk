import { _KnownAny as KnownAny, _StreamAbortMessage as StreamAbortMessage } from './types';
import './utils/shim';

export class _StreamResponse<T> extends Response {
  public static defaultHeaders = {
    'Content-Type': 'text/plain; charset=utf-8',
  };

  public isClosed = false;

  public controller?: ReadableStreamDefaultController;

  public readonly encoder: TextEncoder;

  public readonly readableStream: ReadableStream;

  constructor(init?: ResponseInit) {
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

    super(readableStream, {
      ...init,
      headers: init?.headers ?? _StreamResponse.defaultHeaders,
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
