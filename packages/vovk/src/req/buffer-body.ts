const buffered = new WeakMap<Request, Promise<Request>>();

// reads the body once and makes every body method replay it, so each reader gets it; req.clone() works after,
// new Request(req) doesn't: it takes the request's own body, which is read
export function bufferBody<T extends Request>(req: T): Promise<T> {
  let promise = buffered.get(req);
  if (!promise) {
    promise = replayBody(req);
    buffered.set(req, promise);
  }
  return promise as Promise<T>;
}

async function replayBody<T extends Request>(req: T): Promise<T> {
  const hasBody = req.body !== null;
  const blob = await req.blob();
  const contentType = req.headers?.get('content-type');
  // a Response parses the copy as the request would, form boundary and charset included
  const replay = () => new Response(blob, contentType ? { headers: { 'content-type': contentType } } : undefined);

  Object.defineProperty(req, 'bodyUsed', {
    get: () => false,
    configurable: true,
  });

  Object.defineProperty(req, 'body', {
    get: () => (hasBody ? replay().body : null),
    configurable: true,
  });

  req.json = () => replay().json();
  req.text = () => replay().text();
  req.blob = async () => blob;
  req.arrayBuffer = () => blob.arrayBuffer();
  req.bytes = () => replay().bytes();
  req.formData = () => replay().formData();
  // built from the fields, as Next.js passes a route a Proxy of the request, which new Request(req) refuses
  if (hasBody) {
    req.clone = () =>
      new Request(req.url, { method: req.method, headers: req.headers, body: blob, signal: req.signal });
  }

  return req;
}
