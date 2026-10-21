import {
  createMcpHandler,
  McpServer,
  OAuthError,
  OAuthErrorCode,
  requireBearerAuth,
} from '@modelcontextprotocol/server';
import { deriveTools, ToModelOutput } from 'vovk';
import { getUserIdByToken } from '@/lib/auth';
import TaskController from '@/modules/task/task-controller';

const auth = requireBearerAuth({
  verifier: {
    async verifyAccessToken(token) {
      const userId = getUserIdByToken(token);
      if (!userId) throw new OAuthError(OAuthErrorCode.InvalidToken, 'Unknown token');
      // The SDK refuses a token without an expiry. These tokens don't expire, so it's an hour from now.
      return { token, clientId: userId, scopes: [], expiresAt: Math.floor(Date.now() / 1000) + 3600 };
    },
  },
});

const mcp = createMcpHandler(({ authInfo }) => {
  const tools = deriveTools({
    modules: { TaskController },
    toModelOutput: ToModelOutput.MCP,
    meta: { userId: authInfo?.clientId }, // authGuard reads it with req.vovk.meta()
  });
  const server = new McpServer({ name: 'vovk-agent-ready', version: '1.0.0' });
  for (const { name, title, description, inputSchema, execute } of tools) {
    server.registerTool(name, { title, description, inputSchema }, execute);
  }
  return server;
});

// Next.js passes the route context as a second argument, which mcp.fetch would read as its options
const handler = async (req: Request) => {
  const authInfo = await auth(req);
  return authInfo instanceof Response ? authInfo : mcp.fetch(req, { authInfo });
};

export { handler as GET, handler as POST };
