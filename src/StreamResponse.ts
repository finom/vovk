export class _StreamResponse<T> extends Response {
  static JSON_DIVIDER = '__##DIV123##__'; // protects collisions with JSON data

  private writer: WritableStreamDefaultWriter;

  private encoder: TextEncoder;

  constructor(init: ResponseInit) {
    const responseStream = new TransformStream();
    const writer = responseStream.writable.getWriter();
    const encoder = new TextEncoder();

    super(responseStream.readable, init);

    this.writer = writer;
    this.encoder = encoder;
  }

  send(data: T) {
    const { writer, encoder } = this;
    return writer.write(encoder.encode(JSON.stringify(data) + _StreamResponse.JSON_DIVIDER));
  }

  end() {
    const { writer } = this;
    return writer.close();
  }
}
