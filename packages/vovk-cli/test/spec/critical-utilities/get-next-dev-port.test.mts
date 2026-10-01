import assert from 'node:assert';
import { describe, it } from 'node:test';
import { getNextDevPort } from '../../../dist/dev/get-next-dev-port.mjs';

await describe('getNextDevPort', async () => {
  await it('Reads the port next dev listens on from its arguments', () => {
    assert.strictEqual(getNextDevPort(['-p', '4000']), '4000');
    assert.strictEqual(getNextDevPort(['--turbopack', '--port', '4001']), '4001');
    assert.strictEqual(getNextDevPort(['--port=4002', '--turbopack']), '4002');
    assert.strictEqual(getNextDevPort(['-p4003']), '4003');
    // the last one wins, as in next dev
    assert.strictEqual(getNextDevPort(['-p', '4000', '--port', '4004']), '4004');
  });

  await it('Returns nothing without a port argument', () => {
    assert.strictEqual(getNextDevPort([]), undefined);
    assert.strictEqual(getNextDevPort(['--turbopack', '--experimental-https']), undefined);
  });
});
