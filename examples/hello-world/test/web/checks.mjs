// The same calls as test/node/local.test.mts, written for runtimes without node:test (Workers, browsers)
export async function runChecks({ UserRPC, OpenApiRPC, StreamRPC }, apiRoot) {
  const results = [];
  const check = async (name, fn) => {
    try {
      await fn();
      results.push({ name, ok: true });
    } catch (error) {
      results.push({ name, ok: false, error: String(error?.message ?? error) });
    }
  };
  const id = '123e4567-e89b-12d3-a456-426614174000';
  const body = {
    email: 'john@example.com',
    profile: { name: 'John Doe', age: 25 },
  };

  await check('updateUser', async () => {
    const response = await UserRPC.updateUser({
      apiRoot,
      params: { id },
      body,
      query: { notify: 'email' },
    });
    if (response.id !== id || response.notify !== 'email')
      throw new Error(JSON.stringify(response));
  });
  await check('server validation answers 400', async () => {
    try {
      await UserRPC.updateUser({
        apiRoot,
        params: { id: 'not-a-uuid' },
        body,
        query: { notify: 'email' },
      });
    } catch (error) {
      if (error.statusCode === 400) return;
      throw error;
    }
    throw new Error('no error');
  });
  await check('getSpec', async () => {
    const spec = await OpenApiRPC.getSpec({ apiRoot });
    if (spec.info.title !== '"Hello World" app API')
      throw new Error(spec.info.title);
  });
  await check('streamTokens', async () => {
    const messages = [];
    for await (const item of await StreamRPC.streamTokens({ apiRoot }))
      messages.push(item.message);
    if (!messages.join('').startsWith('Vovk.ts is'))
      throw new Error(messages.join(''));
  });
  return results;
}
