import type { MetaRecord } from 'nextra';

const separator = (title: string) => ({ type: 'separator', title });

const meta = {
  '#getting-started': separator('Getting Started'),
  overview: 'Realtime Kanban Overview',
  run: 'Run Locally with Docker Compose',
  deploy: 'Deploy to Vercel',
  '#client': separator('Front-end Setup'),
  state: 'State Normalization with Zustand',
  '#server': separator('Back-end Setup'),
  database: 'Database Setup with Prisma and Zod Generator',
  endpoints: 'API Endpoints',
  embeddings: 'Vector Search via Embeddings',
  polling: 'Database Polling with Redis',
  authentication: 'Basic Authentication and Authorization (Password Protection)',
  '#ai': separator('AI Integration'),
  'text-ai': 'Text AI Chat Integration with AI SDK and AI Elements',
  'voice-ai': 'OpenAI Realtime API with WebRTC',
  mcp: 'MCP Server with mcp-handler',
  telegram: 'Telegram Bot with OpenAPI Mixins',
} as const satisfies MetaRecord;

export const icons: Omit<Record<keyof typeof meta, string>, `#${string}`> = {
  overview: '📘',
  run: '▶️',
  deploy: '🚀',
  state: '🧩',
  endpoints: '🔗',
  embeddings: '🧠',
  database: '🗃️',
  'text-ai': '🤖',
  'voice-ai': '🎙️',
  polling: '🔄',
  authentication: '🔐',
  mcp: '🔌',
  telegram: '📨',
};

export default meta;
