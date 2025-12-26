import type { VovkRequest } from '../types';
import type { VovkTool } from './types';
import { reqMeta } from '../req/reqMeta';

export type MCPModelOutput = {
  content: [
    | { type: 'audio'; mimeType: string; data: string }
    | { type: 'image'; mimeType: string; data: string }
    | { type: 'text'; text: string },
  ];
  annotations?: {
    audience?: ('user' | 'assistant')[];
    priority?: number;
    lastModified?: string;
  };
  structuredContent?: { [key: string]: unknown };
  isError?: boolean;
};

const toBase64 = (buf: ArrayBuffer) =>
  typeof Buffer !== 'undefined'
    ? Buffer.from(buf).toString('base64')
    : btoa([...new Uint8Array(buf)].map((b) => String.fromCharCode(b)).join(''));

async function responseToMCP(res: Response): Promise<MCPModelOutput> {
  const mimeType = res.headers.get('Content-Type')?.split(';')[0].trim() || '';

  if (mimeType.startsWith('audio/')) {
    return { content: [{ type: 'audio', mimeType, data: toBase64(await res.arrayBuffer()) }] };
  }

  if (mimeType.startsWith('image/')) {
    return { content: [{ type: 'image', mimeType, data: toBase64(await res.arrayBuffer()) }] };
  }

  if (mimeType === 'application/json') {
    const structuredContent = await res.json();
    return {
      content: [{ type: 'text', text: JSON.stringify(structuredContent) }],
      structuredContent,
    };
  }

  if (mimeType.startsWith('text/') || /xml|javascript|yaml/.test(mimeType)) {
    return { content: [{ type: 'text', text: await res.text() }] };
  }

  return {
    content: [{ type: 'text', text: `Unsupported response content type ${mimeType}` }],
    isError: true,
  };
}

type ToModelOutputMCPFn = <TOutput>(
  result: TOutput | Error,
  tool: VovkTool,
  req: Pick<VovkRequest, 'vovk'> | null
) => Promise<MCPModelOutput>;

export const toModelOutputMCP: ToModelOutputMCPFn = async (result: unknown, _tool, req): Promise<MCPModelOutput> => {
  const mcpOutputMeta = req ? (reqMeta(req).mcpOutput as MCPModelOutput) : null;
  if (result instanceof Response) {
    return { ...(await responseToMCP(result)), ...(mcpOutputMeta || {}) };
  }

  const isError = result instanceof Error;
  return {
    content: [
      {
        type: 'text',
        text: isError ? result.message : JSON.stringify(result),
      },
    ],
    ...(isError ? { isError: true } : {}),
    ...(!isError && typeof result === 'object' && result !== null
      ? { structuredContent: result as { [key: string]: unknown } }
      : {}),
    ...(mcpOutputMeta || {}),
  };
};
