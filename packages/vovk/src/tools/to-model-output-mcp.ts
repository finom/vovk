import { reqMeta } from '../req/req-meta.js';
import type { VovkRequest } from '../types/request.js';
import type { StandardToolV0 } from '../types/standard-tool.js';
import type { KnownAny } from '../types/utils.js';
import { toModelErrorMessage } from './to-model-error-message.js';

type MCPAnnotations = {
  audience?: ('user' | 'assistant')[];
  priority?: number;
  lastModified?: string;
};

export type MCPModelOutput = {
  content: [
    | { type: 'audio'; mimeType: string; data: string; annotations?: MCPAnnotations }
    | { type: 'image'; mimeType: string; data: string; annotations?: MCPAnnotations }
    | { type: 'text'; text: string; annotations?: MCPAnnotations },
  ];
  structuredContent?: { [key: string]: unknown };
  isError?: boolean;
};

// the mcpOutput meta a handler sets: fields that replace the output's, and annotations for each content item
type MCPOutputMeta = Partial<MCPModelOutput> & { annotations?: MCPAnnotations };

// MCP structured content is an object: an array goes under "items", any other value has none
const toStructuredContent = (data: unknown): Pick<MCPModelOutput, 'structuredContent'> => {
  if (Array.isArray(data)) return { structuredContent: { items: data } };
  if (typeof data === 'object' && data !== null) return { structuredContent: data as { [key: string]: unknown } };
  return {};
};

const toBase64 = (buf: ArrayBuffer) =>
  typeof Buffer !== 'undefined'
    ? Buffer.from(buf).toString('base64')
    : btoa([...new Uint8Array(buf)].map((b) => String.fromCharCode(b)).join(''));

async function responseContentToMCP(res: Response): Promise<MCPModelOutput> {
  const mimeType = res.headers.get('Content-Type')?.split(';')[0].trim() || '';

  if (mimeType.startsWith('audio/')) {
    return { content: [{ type: 'audio', mimeType, data: toBase64(await res.arrayBuffer()) }] };
  }

  if (mimeType.startsWith('image/')) {
    return { content: [{ type: 'image', mimeType, data: toBase64(await res.arrayBuffer()) }] };
  }

  if (mimeType === 'application/json' || mimeType.endsWith('+json')) {
    const data = await res.json();
    return { content: [{ type: 'text', text: JSON.stringify(data) }], ...toStructuredContent(data) };
  }

  if (mimeType.startsWith('text/') || /xml|javascript|yaml/.test(mimeType)) {
    return { content: [{ type: 'text', text: await res.text() }] };
  }

  return {
    content: [{ type: 'text', text: `Unsupported response content type ${mimeType}` }],
    isError: true,
  };
}

// an error status fails the call whatever the body says, e.g. an application/problem+json document
async function responseToMCP(res: Response): Promise<MCPModelOutput> {
  const output = await responseContentToMCP(res);
  return res.ok ? output : { content: output.content, isError: true };
}

type ToModelOutputMCPFn = <TOutput>(
  result: TOutput | Error,
  tool: StandardToolV0<KnownAny, KnownAny, KnownAny>,
  req: Pick<VovkRequest, 'vovk'> | null
) => Promise<MCPModelOutput>;

// MCP annotates each content item, a tool result has no annotations of its own
function withMeta(output: MCPModelOutput, meta: MCPOutputMeta | undefined): MCPModelOutput {
  const { annotations, ...fields } = meta ?? {};
  const result = { ...output, ...fields };
  if (!annotations) return result;
  const content = result.content.map((item) => ({ ...item, annotations: item.annotations ?? annotations }));
  return { ...result, content: content as MCPModelOutput['content'] };
}

export const toModelOutputMCP: ToModelOutputMCPFn = async (result: unknown, _tool, req): Promise<MCPModelOutput> => {
  const mcpOutputMeta = req ? (reqMeta(req).mcpOutput as MCPOutputMeta | undefined) : undefined;
  if (result instanceof Response) {
    return withMeta(await responseToMCP(result), mcpOutputMeta);
  }

  if (result instanceof Error) {
    return withMeta({ content: [{ type: 'text', text: toModelErrorMessage(result) }], isError: true }, mcpOutputMeta);
  }

  return withMeta(
    {
      // a handler that returns nothing has no JSON text
      content: [{ type: 'text', text: JSON.stringify(result) ?? '' }],
      ...toStructuredContent(result),
    },
    mcpOutputMeta
  );
};
