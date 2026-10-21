import { createDecorator, HttpException, HttpStatus } from 'vovk';
import { getBearerToken, getUserIdByToken } from '@/lib/auth';

export interface AuthMeta {
  userId: string;
}

// An HTTP request proves the user with a bearer token. A call through .fn(), as from the MCP route,
// has no URL: the caller has checked the token already and passes the user in the meta.
export const authGuard = createDecorator((req, next) => {
  if (typeof req.url !== 'undefined') {
    const token = getBearerToken(req.headers.get('authorization'));
    const userId = token && getUserIdByToken(token);
    if (!userId) throw new HttpException(HttpStatus.UNAUTHORIZED, 'Missing or unknown bearer token');
    req.vovk.meta<AuthMeta>({ userId });
  } else if (!req.vovk.meta<Partial<AuthMeta>>().userId) {
    throw new HttpException(HttpStatus.UNAUTHORIZED, 'No userId in the call meta');
  }
  return next();
});
