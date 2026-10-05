const buffered = new WeakMap<Request, Promise<Request>>();

/**
 * Reads the body once and makes every body method replay it, so a decorator, the segment's onBefore, a procedure
 * and the handler can each read it. Calls after the first share its copy. It reads a clone, so the request's own body
 * stays unread for req.clone(), new Request(req) and fetch(req); until the request is done, the body is held twice.
 */
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
  const blob = await req.clone().blob();
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

  return req;
}
