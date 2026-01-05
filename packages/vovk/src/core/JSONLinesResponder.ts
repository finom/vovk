import type { StreamAbortMessage } from '../types';
import '../utils/shim';

export abstract class Responder {
  public readonly response: Response;
}

/**
 * A Response subclass for streaming JSON Lines (JSONL) data.
 * @see https://vovk.dev/jsonlines
 */
export class JSONLinesResponder<T> extends Responder {
  private isClosed = false;

  private controller?: ReadableStreamDefaultController | null;

  private readonly encoder: TextEncoder | null;

  public readonly response: Response;

  public readonly readableStream: ReadableStream | null;

  public readonly headers: Record<string, string>;

  public onBeforeSend = (item: T) => item;

  constructor(request: Request | null, getResponse?: (responder: JSONLinesResponder<T>) => Response) {
    super();
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

    const headers = {
      'content-type': accept?.includes('application/jsonl')
        ? 'application/jsonl; charset=utf-8'
        : 'text/plain; charset=utf-8',
    };

    this.headers = headers;
    this.readableStream = request ? readableStream : null;
    this.encoder = request ? encoder : null;
    this.controller = request ? readableController! : null;
    this.response = getResponse?.(this) ?? new Response(readableStream, { headers });

    request?.signal?.addEventListener('abort', this.close, { once: true });

    // this will make promise on the client-side to resolve immediately, before sending the first JSON line
    this.controller?.enqueue(encoder?.encode(''));
  }

  public readonly send = (item: T) => {
    const processedItem = this.onBeforeSend(item);
    this.sendItemOrData(processedItem);
  };

  public sendItemOrData = (data: T | StreamAbortMessage) => {
    const { controller, encoder } = this;
    if (this.isClosed) return;

    // Enqueue to the ReadableStream
    controller?.enqueue(encoder?.encode(JSON.stringify(data) + '\n'));
  };

  public readonly close = () => {
    const { controller } = this;
    if (this.isClosed) return;
    this.isClosed = true;
    controller?.close();
  };

  public readonly throw = (e: unknown) => {
    this.sendItemOrData({ isError: true, reason: e instanceof Error ? e.message : (e as unknown) });
    return this.close();
  };
}
