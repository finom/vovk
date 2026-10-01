import { createDecorator, HttpException, HttpStatus } from 'vovk';
import { isLoggedIn } from '@/lib/dal';

export const sessionGuard = createDecorator(async (req, next) => {
  if (typeof req.url !== 'undefined' && !(await isLoggedIn())) {
    throw new HttpException(HttpStatus.UNAUTHORIZED, 'Unauthorized');
  }
  return next();
});
