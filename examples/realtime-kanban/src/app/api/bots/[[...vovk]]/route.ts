import { initSegment } from 'vovk';
import TelegramController from '../../../../modules/telegram/telegram-controller';

const controllers = {
  TelegramBot: TelegramController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({
  segmentName: 'bots',
  emitSchema: false, // Disable schema emission for bot endpoints
  controllers,
});
