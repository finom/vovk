import { post, prefix } from 'vovk';
import TelegramService from './telegram-service';

@prefix('telegram')
export default class TelegramController {
  @post('bot')
  static handle = TelegramService.handle.bind(TelegramService);
}
