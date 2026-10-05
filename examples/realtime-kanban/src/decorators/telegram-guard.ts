import { timingSafeEqual } from 'node:crypto';
import { createDecorator, HttpException, HttpStatus } from 'vovk';

// Telegram sends the secret_token given to setWebhook in this header with every update
export const telegramGuard = createDecorator(async (req, next) => {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!process.env.TELEGRAM_BOT_TOKEN || !secret) {
    throw new HttpException(HttpStatus.NOT_FOUND, 'Not found');
  }
  const given = Buffer.from(
    req.headers.get('x-telegram-bot-api-secret-token') ?? '',
  );
  const expected = Buffer.from(secret);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    throw new HttpException(HttpStatus.UNAUTHORIZED, 'Unauthorized');
  }
  return next();
});
