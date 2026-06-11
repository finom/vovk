export async function bufferBody<T extends Request>(req: T): Promise<T> {
  const buffer = await req.arrayBuffer();

  Object.defineProperty(req, 'bodyUsed', {
    get: () => false,
    configurable: true,
  });

  Object.defineProperty(req, 'body', {
    get: () =>
      new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array(buffer.slice(0)));
          controller.close();
        },
      }),
    configurable: true,
  });

  req.json = async () => JSON.parse(new TextDecoder().decode(buffer));
  req.text = async () => new TextDecoder().decode(buffer);
  req.blob = async () => new Blob([buffer.slice(0)]);
  req.arrayBuffer = async () => buffer.slice(0);
  req.bytes = async () => new Uint8Array(buffer.slice(0));
  req.formData = async () => {
    const r = new Request('http://localhost', {
      method: req.method,
      headers: req.headers,
      body: buffer.slice(0),
    });
    return r.formData();
  };

  return req;
}
