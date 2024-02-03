import { _KnownAny as KnownAny, _StreamAbortMessage as StreamAbortMessage } from './types';

export class _StreamResponse<T> extends Response {
  public static readonly JSON_DIVIDER = '__##DIV123##__'; // protects collisions of JSON data

  public static defaultHeaders = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Content-Encoding': 'none',
    'Cache-Control': 'no-cache, no-transform',
  };

  public readonly writer: WritableStreamDefaultWriter;

  public readonly encoder: TextEncoder;

  constructor(init?: ResponseInit) {
    const responseStream = new TransformStream();
    const writer = responseStream.writable.getWriter();
    const encoder = new TextEncoder();

    super(responseStream.readable, {
      ...init,
      headers: init?.headers ?? _StreamResponse.defaultHeaders,
    });

    this.writer = writer;
    this.encoder = encoder;
  }

  public send(data: T | StreamAbortMessage) {
    const { writer, encoder } = this;
    return writer.write(encoder.encode(JSON.stringify(data) + _StreamResponse.JSON_DIVIDER));
  }

  public close() {
    const { writer } = this;
    return writer.close();
  }

  public async throw(e: KnownAny) {
    const { writer } = this;
    await this.send({ isError: true, reason: e instanceof Error ? e.message : (e as unknown) });
    await new Promise((resolve) => setTimeout(resolve, 0));
    return writer.abort(e);
  }
}
