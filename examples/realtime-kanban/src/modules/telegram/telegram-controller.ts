import { post, prefix } from 'vovk';
import { telegramGuard } from '@/decorators/telegram-guard';
import TelegramService from './telegram-service';

@prefix('telegram')
export default class TelegramController {
  @post('bot')
  @telegramGuard()
  static handle = TelegramService.handle.bind(TelegramService);
}
