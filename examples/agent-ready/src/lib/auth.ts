// API_TOKENS lists "userId:token" pairs separated by commas. Replace this lookup with your own:
// API keys in a database, a session store or an OAuth introspection call.
export function getUserIdByToken(token: string): string | null {
  for (const entry of (process.env.API_TOKENS ?? '').split(',')) {
    const [userId, entryToken] = entry.trim().split(':');
    if (userId && entryToken && entryToken === token) return userId;
  }
  return null;
}

export function getBearerToken(authorization: string | null): string | null {
  const [scheme, token] = authorization?.split(' ') ?? [];
  return scheme?.toLowerCase() === 'bearer' && token ? token : null;
}
