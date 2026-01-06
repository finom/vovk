import type { StreamAbortMessage } from '../types';
import '../utils/shim';

export abstract class Responder {
  public response: Response;
}

/**
 * A Responder subclass for streaming JSON Lines (JSONL) data.
 * @see https://vovk.dev/jsonlines
 * @param request The incoming Request object.
 * @param getResponse Optional function to create a custom Response object.
 * @example
 * ```ts
 * import { JSONLinesResponder } from 'vovk';
 *
 * const responder = new JSONLinesResponder<MyItemType>(request, (responder) => {
 *   return new Response(responder.readableStream, { headers: responder.headers });
 * });
 *
 * // Send items
 * responder.send({ ... });
 * // Close the stream when done
 * responder.close();
 * // Or throw an error
 * responder.throw(new Error('Something went wrong'));
 * // get the Response object, headers, etc.
 * const { response, headers } = responder;
 * ```
 */
export class JSONLinesResponder<T> extends Responder {
  private isClosed = false;

  private i = 0;

  private controller?: ReadableStreamDefaultController | null;

  private readonly encoder: TextEncoder | null;

  public readonly readableStream: ReadableStream | null;

  public readonly headers: Record<string, string>;

  public onBeforeSend: (item: T, i: number) => T | Promise<T> = (item) => item;

  constructor(request?: Request | null, getResponse?: (responder: JSONLinesResponder<T>) => Response) {
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
    this.readableStream = readableStream;
    this.encoder = encoder;
    this.controller = readableController!;
    this.response = getResponse?.(this) ?? new Response(readableStream, { headers });

    request?.signal?.addEventListener('abort', this.close, { once: true });

    // this will make promise on the client-side to resolve immediately, before sending the first JSON line
    this.controller?.enqueue(encoder?.encode(''));
  }

  public readonly send = async (item: T) => this.sendLineOrError(await this.onBeforeSend(item, this.i++));

  public sendLineOrError = (data: T | StreamAbortMessage) => {
    const { controller, encoder } = this;
    if (this.isClosed) return;

    controller?.enqueue(encoder?.encode(JSON.stringify(data) + '\n'));
  };

  public readonly close = () => {
    const { controller } = this;
    if (this.isClosed) return;
    this.isClosed = true;
    controller?.close();
  };

  public readonly throw = (e: unknown) => {
    this.sendLineOrError({ isError: true, reason: e instanceof Error ? e.message : (e as unknown) });
    return this.close();
  };
}
