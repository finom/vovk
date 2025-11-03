import assert from 'node:assert';
import { test, describe } from 'node:test';
import { type Mixins, TelegramAPI, schema, openapi } from '../dist/telegram/index.mjs';

describe('Telegram', () => {
  test('TelegramAPI and Mixins', async () => {
    assert(TelegramAPI.sendMessage); // TODO: there is no known way to test the RPC module without a token
    ({
      latitude: 10,
      longitude: 20,
      Field: {}, // ???
    }) satisfies Mixins.Telegram.Location;
  });

  test('schema', async () => {
    assert(schema);
    assert(schema.segments.telegram);
    assert(schema.segments.telegram.emitSchema);
    assert(schema.segments.telegram.segmentType === 'mixin');
  });

  test('openapi', async () => {
    assert.equal(openapi.info.title, 'Telegram Bot API');
  });
});
