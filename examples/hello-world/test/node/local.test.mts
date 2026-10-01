import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { OpenApiRPC, StreamRPC, UserRPC } from '../../src/client/index.ts';

const updateUserPayload = {
  params: {
    id: '123e4567-e89b-12d3-a456-426614174000',
  },
  body: {
    email: 'john@example.com',
    profile: {
      name: 'John Doe',
      age: 25,
    },
  },
  query: {
    notify: 'email' as const,
  },
};

const expectedStreamText =
  'Vovk.ts is a RESTful back-end meta-framework with RPC, built on top of the Next.js App Router. This text is a JSONLines stream demo.';

describe('local RPC integration', () => {
  test('UserRPC.updateUser echoes the request payload', async () => {
    const response = await UserRPC.updateUser(updateUserPayload);

    assert.deepStrictEqual(response, {
      success: true,
      id: updateUserPayload.params.id,
      notify: updateUserPayload.query.notify,
    });
  });

  test('OpenApiRPC.getSpec exposes hello-world metadata', async () => {
    const spec = await OpenApiRPC.getSpec();

    assert.equal(spec.info.title, '"Hello World" app API');
    assert.equal(spec.info.version, '1.0.0');
    assert.ok(spec.paths);
  });

  test('StreamRPC.streamTokens streams the demo text', async () => {
    const stream = await StreamRPC.streamTokens();
    const messages: string[] = [];

    for await (const item of stream) {
      messages.push(item.message);
      process.stdout.write(item.message);
    }

    process.stdout.write('\n');

    assert.ok(messages.length > 0);
    assert.equal(messages.join('').trim(), expectedStreamText);
  });
});
