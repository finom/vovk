import type { StreamAbortMessage } from '../types/core.js';
import { HttpStatus } from '../types/enums.js';
import { isHttpException, toResponseStatus } from './http-exception.js';
import '../utils/shim.js';

export abstract class Responder {
  public response!: Response;
}

// bytes queued for a slow client before send() waits for it to read
const HIGH_WATER_MARK = 64 * 1024;

// until something reads the stream, send() waits only past this, so a handler that sends before it returns the
// responder isn't stuck waiting for a read that can't start
const UNREAD_LIMIT = 16 * 1024 * 1024;

// the digests of notFound(), forbidden() and unauthorized() from next/navigation, and of notFound() in Next.js 15.0:
// once a stream started Next.js can't answer them, so the error line carries their status
const NAVIGATION_ERROR_LINES: Record<string, StreamAbortMessage> = {
  'NEXT_HTTP_ERROR_FALLBACK;401': { isError: true, reason: 'Unauthorized', statusCode: HttpStatus.UNAUTHORIZED },
  'NEXT_HTTP_ERROR_FALLBACK;403': { isError: true, reason: 'Forbidden', statusCode: HttpStatus.FORBIDDEN },
  'NEXT_HTTP_ERROR_FALLBACK;404': { isError: true, reason: 'Not found', statusCode: HttpStatus.NOT_FOUND },
  NEXT_NOT_FOUND: { isError: true, reason: 'Not found', statusCode: HttpStatus.NOT_FOUND },
};

type ResponderHooks = { onBeforeSend?: (item: unknown, i: number) => unknown; onError?: (error: unknown) => void };

// what vovk sets on a request before its handler runs, so a responder made with it checks and reports a line the
// handler sends before it returns the responder
const HOOKS = Symbol('vovk.responderHooks');

type WithHooks = { [HOOKS]?: ResponderHooks };

export function setResponderHooks(request: object, hooks: ResponderHooks) {
  const current = (request as WithHooks)[HOOKS];
  (request as WithHooks)[HOOKS] = current ? { ...current, ...hooks } : hooks;
}

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
  // set at once by close() and throw(): later lines are dropped, the queued ones still go out
  private closing = false;

  // the stream is closed, or the client went away
  private closed = false;

  private i = 0;

  // lines and the closing step are chained so unawaited calls keep their order, see enqueue()
  private queue: Promise<void> = Promise.resolve();

  private hasSent = false;

  // resolves the send that waits for the client to read, see waitForRoom()
  private resumeSend: (() => void) | null = null;

  private controller?: ReadableStreamDefaultController | null;

  private readonly encoder: TextEncoder | null;

  public readonly readableStream: ReadableStream | null;

  public readonly headers: Record<string, string>;

  public onBeforeSend: (item: T, i: number) => T | Promise<T> = (item) => item;

  // set by vovk to the segment's onError: a failed send ends the stream, and its caller never sees the error
  public _onError?: (error: unknown) => void;

  constructor(request?: Request | null, getResponse?: (responder: JSONLinesResponder<T>) => Response) {
    super();
    const encoder = new TextEncoder();
    let readableController: ReadableStreamDefaultController;

    const readableStream = new ReadableStream(
      {
        start: (controller) => {
          readableController = controller;
        },
        pull: () => this.resume(),
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

    // an empty first chunk lets the client's fetch resolve before the first line
    this.controller?.enqueue(encoder?.encode(''));

    const hooks = (request as (Request & WithHooks) | null | undefined)?.[HOOKS];
    if (hooks?.onBeforeSend) this.onBeforeSend = hooks.onBeforeSend as (item: T, i: number) => T | Promise<T>;
    if (hooks?.onError) this._onError = hooks.onError;

    if (request?.signal?.aborted) this.abort();
    else request?.signal?.addEventListener('abort', this.abort, { once: true });
  }

  /** Whether the stream is closed: by close() or throw(), or because the client went away. Later lines are dropped. */
  public get isClosed() {
    return this.closing || this.closed;
  }

  public readonly send = async (item: T) => {
    if (this.isClosed) return;
    await this.enqueue(async () => {
      if (!this.hasSent) {
        this.hasSent = true;
        // a tick for withValidationLibrary to set onBeforeSend, or the first line skips iteration validation
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      const line = await this.onBeforeSend(item, this.i++);
      await this.waitForRoom();
      this.writeLine(line);
    });
  };

  /** Writes a line as it is, after the queued ones. */
  public sendLineOrError = (data: T | StreamAbortMessage) => {
    if (this.isClosed) return;
    void this.enqueue(() => this.writeLine(data));
  };

  public readonly close = () => {
    if (this.isClosed) return this.queue;
    this.closing = true;
    return this.enqueue(() => this.end());
  };

  public readonly throw = (e: unknown) => {
    if (this.isClosed) return this.queue;
    const errorLine = this.toErrorLine(e);
    this.closing = true;
    return this.enqueue(() => this.end(errorLine));
  };

  // a step that throws, as a send failing iteration validation, ends the stream with an error line and drops the rest
  private enqueue(step: () => unknown) {
    this.queue = this.queue.then(async () => {
      if (this.closed) return;
      try {
        await step();
      } catch (e) {
        this.closing = true;
        this._onError?.(e);
        this.end(this.toErrorLine(e));
      }
    });
    return this.queue;
  }

  private writeLine(data: unknown) {
    if (this.closed) return;
    // JSON.stringify gives undefined for undefined, a line the client can't parse, so it is null as in a JSON response
    this.controller?.enqueue(this.encoder?.encode(`${JSON.stringify(data) ?? 'null'}\n`));
  }

  private toErrorLine(e: unknown) {
    const digest = (e as { digest?: unknown } | null)?.digest;
    if (typeof digest === 'string' && Object.hasOwn(NAVIGATION_ERROR_LINES, digest)) {
      return JSON.stringify(NAVIGATION_ERROR_LINES[digest]);
    }
    // same rule as a non streaming handler: an error other than an HttpException is internal, and so is status 0,
    // which a client throws for a call that got no response
    if ((!isHttpException(e) || e.statusCode === HttpStatus.NULL) && process.env.NODE_ENV === 'production') {
      console.error('🐺 Unhandled error in a Vovk stream:', e);
      return JSON.stringify({ isError: true, reason: 'Internal server error' } satisfies StreamAbortMessage);
    }
    // the client takes a line for an error only with these keys; the status is the one a JSON response would have
    const errorLine: StreamAbortMessage = {
      isError: true,
      reason: e instanceof Error ? e.message : e,
      ...(isHttpException(e) ? { statusCode: toResponseStatus(e.statusCode) } : {}),
    };
    try {
      return JSON.stringify(errorLine);
    } catch {
      // a thrown value JSON can't serialize, as a cycle or a BigInt
      return JSON.stringify({ ...errorLine, reason: String(e) });
    }
  }

  private end(errorLine?: string) {
    if (this.closed) return;
    if (errorLine) this.controller?.enqueue(this.encoder?.encode(`${errorLine}\n`));
    this.closed = true;
    this.controller?.close();
  }

  // a full queue means the client reads slower than the lines come
  private async waitForRoom() {
    while (!this.closed && this.queuedBytes() >= (this.readableStream?.locked ? HIGH_WATER_MARK : UNREAD_LIMIT)) {
      await new Promise<void>((resolve) => {
        this.resumeSend = resolve;
      });
    }
  }

  private queuedBytes() {
    return HIGH_WATER_MARK - (this.controller?.desiredSize ?? HIGH_WATER_MARK);
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
