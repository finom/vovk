import type { StreamAbortMessage } from '../types/core.js';
import { isHttpException } from './http-exception.js';
import '../utils/shim.js';

export abstract class Responder {
  public response!: Response;
}

// bytes queued for a slow client before send() waits for it to read
const HIGH_WATER_MARK = 64 * 1024;

/**
 * Responder subclass for streaming JSON Lines. @see https://vovk.dev/jsonlines
 * @example
 * ```ts
 * import { JSONLinesResponder } from 'vovk';
 *
 * const responder = new JSONLinesResponder<MyItemType>(request, (responder) => {
 *   return new Response(responder.readableStream, { headers: responder.headers });
 * });
 *
 * responder.send({ ... }); // send items
 * responder.close(); // close the stream when done
 * responder.throw(new Error('Something went wrong'));
 * const { response, headers } = responder;
 * ```
 */
export class JSONLinesResponder<T> extends Responder {
  private closed = false;

  private i = 0;

  private pendingSends = new Set<Promise<void>>();

  // sends are chained so unawaited calls keep their order, see send()
  private sendQueue: Promise<void> = Promise.resolve();

  private hasSent = false;

  // resolves the send that waits for the client to read, see waitForRoom()
  private resumeSend: (() => void) | null = null;

  private controller?: ReadableStreamDefaultController | null;

  private readonly encoder: TextEncoder | null;

  public readonly readableStream: ReadableStream | null;

  public readonly headers: Record<string, string>;

  public onBeforeSend: (item: T, i: number) => T | Promise<T> = (item) => item;

  constructor(request?: Request | null, getResponse?: (responder: JSONLinesResponder<T>) => Response) {
    super();
    const encoder = new TextEncoder();
    let readableController: ReadableStreamDefaultController;

    const readableStream = new ReadableStream(
      {
        start: (controller) => {
          readableController = controller;
        },
        // the client read enough of the queue for more lines
        pull: () => this.resume(),
        // the client stopped reading
        cancel: () => this.stop(),
      },
      { highWaterMark: HIGH_WATER_MARK, size: (chunk: Uint8Array) => chunk.byteLength }
    );

    const accept = request?.headers?.get('accept');

    const headers = {
      'content-type': accept?.includes('application/jsonl')
        ? 'application/jsonl; charset=utf-8'
        : 'text/plain; charset=utf-8',
    };

    this.headers = headers;
    this.readableStream = readableStream;
    this.encoder = encoder;
    // biome-ignore lint/style/noNonNullAssertion: assigned at readableStream start
    this.controller = readableController!;
    this.response = getResponse?.(this) ?? new Response(readableStream, { headers });

    // this will make promise on the client-side to resolve immediately, before sending the first JSON line
    this.controller?.enqueue(encoder?.encode(''));

    if (request?.signal?.aborted) this.abort();
    else request?.signal?.addEventListener('abort', this.abort, { once: true });
  }

  /** Whether the stream is closed: by close() or throw(), or because the client went away. Later lines are dropped. */
  public get isClosed() {
    return this.closed;
  }

  public readonly send = async (item: T) => {
    // chaining keeps lines in call order even when send() is not awaited
    const promise = this.sendQueue.then(async () => {
      if (this.closed) return;
      try {
        if (!this.hasSent) {
          this.hasSent = true;
          // zero timeout lets withValidationLibrary set onBeforeSend before the first send,
          // otherwise immediate streaming would skip the first iteration validation
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
        const line = await this.onBeforeSend(item, this.i++);
        await this.waitForRoom();
        this.sendLineOrError(line);
      } catch (e) {
        this.throw(e);
      }
    });
    this.sendQueue = promise;
    this.pendingSends.add(promise);
    try {
      await promise;
    } finally {
      this.pendingSends.delete(promise);
    }
  };

  public sendLineOrError = (data: T | StreamAbortMessage) => {
    const { controller, encoder } = this;
    if (this.closed) return;

    controller?.enqueue(encoder?.encode(`${JSON.stringify(data)}\n`));
  };

  public readonly close = async () => {
    if (this.closed) return;
    // let unawaited send() calls finish first, per the documented send-then-close pattern
    while (this.pendingSends.size) {
      await Promise.allSettled([...this.pendingSends]);
    }
    if (this.closed) return;
    this.closed = true;
    this.controller?.close();
  };

  public readonly throw = (e: unknown) => {
    // same rule as a non streaming handler, an error other than an HttpException is internal
    if (!isHttpException(e) && process.env.NODE_ENV === 'production') {
      console.error('🐺 Unhandled error in a Vovk stream:', e);
      this.sendLineOrError({ isError: true, reason: 'Internal server error' });
      return this.close();
    }
    this.sendLineOrError({
      isError: true,
      reason: e instanceof Error ? e.message : e,
      ...(isHttpException(e) ? { statusCode: e.statusCode } : {}),
    });
    return this.close();
  };

  // a full queue means the client reads slower than the lines come
  private async waitForRoom() {
    while (!this.closed && (this.controller?.desiredSize ?? 1) <= 0) {
      await new Promise<void>((resolve) => {
        this.resumeSend = resolve;
      });
    }
  }

  private resume() {
    const { resumeSend } = this;
    this.resumeSend = null;
    resumeSend?.();
  }

  // the client went away, nothing more is sent and a send waiting for room returns
  private stop() {
    this.closed = true;
    this.resume();
  }

  private readonly abort = () => {
    if (this.closed) return;
    this.stop();
    this.controller?.close();
  };
}
