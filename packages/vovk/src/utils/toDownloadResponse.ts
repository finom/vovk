type BinaryData = Blob | File | ArrayBuffer | Uint8Array | ReadableStream<Uint8Array> | string;

export function toDownloadResponse(
  data: BinaryData,
  { filename, type, headers }: { filename?: string; type?: string; headers?: Record<string, string> } = {}
): Response {
  const body =
    data instanceof Blob
      ? data
      : data instanceof ReadableStream
        ? data
        : new Blob([data as BlobPart], { type: type ?? 'application/octet-stream' });

  const resolvedName = filename ?? (data instanceof File ? data.name : undefined);
  const resolvedType = type ?? (body instanceof Blob ? body.type : undefined);

  return new Response(body, {
    headers: {
      ...(resolvedType ? { 'Content-Type': resolvedType } : {}),
      ...(resolvedName
        ? {
            'Content-Disposition': `attachment; filename="${resolvedName.replace(/[^\x20-\x7E]|"/g, '_')}"; filename*=UTF-8''${encodeURIComponent(resolvedName)}`,
          }
        : {}),
      ...headers,
    },
  });
}
