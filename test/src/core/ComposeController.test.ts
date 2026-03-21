import { it, describe } from 'node:test';
import { deepStrictEqual, strictEqual } from 'node:assert';
import { request } from '../lib.ts';

describe('Compose function', () => {
  const names = ['get', 'post', 'put', 'patch', 'del'] as const;

  for (const name of names) {
    it(`Should handle ${name} requests via compose`, async () => {
      const response = await request[name]('/compose');
      strictEqual(response.status, 200);
      deepStrictEqual(response.body, { method: name });
    });
  }

  it('Should handle head via compose', async () => {
    const response = await request.head('/compose');
    strictEqual(response.status, 200);
    strictEqual(response.headers['x-head-header'], 'head');
  });

  it('Should handle options via compose', async () => {
    const response = await request.options('/compose');
    strictEqual(response.status, 200);
    strictEqual(response.headers['x-options-header'], 'options');
  });

  it('Should handle custom path via compose', async () => {
    const response = await request.get('/compose/custom-path');
    strictEqual(response.status, 200);
    deepStrictEqual(response.body, { path: 'custom-path' });
  });

  it('Should handle decorator header via compose', async () => {
    const response = await request.get('/compose/get-with-header');
    strictEqual(response.status, 200);
    strictEqual(response.headers['x-decorator-header'], 'hello');
  });

  it('Should handle CORS via compose', async () => {
    const response = await request.get('/compose/get-with-cors');
    strictEqual(response.status, 200);
    strictEqual(response.headers['access-control-allow-origin'], '*');
  });

  it('Should handle before via compose', async () => {
    const response = await request.get('/compose/get-with-before');
    strictEqual(response.status, 200);
    deepStrictEqual(response.body, { before: true });
  });

  it('Should handle custom decorator via compose', async () => {
    const response = await request.get('/compose/get-with-custom-decorator');
    strictEqual(response.status, 200);
    deepStrictEqual(response.body, { hello: 'world' });
  });
});

describe('Compose function (class-level)', () => {
  it('Should handle class-level compose with prefix', async () => {
    const response = await request.get('/compose-class');
    strictEqual(response.status, 200);
    deepStrictEqual(response.body, { method: 'get', source: 'compose-class' });
  });

  it('Should handle class-level compose with prefix and custom path', async () => {
    const response = await request.get('/compose-class/with-path');
    strictEqual(response.status, 200);
    deepStrictEqual(response.body, { path: 'with-path', source: 'compose-class' });
  });

  it('Should handle class-level compose with cloneControllerMetadata', async () => {
    // ComposeClonedController clones from ComposeController and has prefix 'compose-cloned'
    // It inherits all handlers from ComposeController
    const response = await request.get('/compose-cloned');
    strictEqual(response.status, 200);
    deepStrictEqual(response.body, { method: 'get' });
  });

  it('Should handle cloned controller custom path', async () => {
    const response = await request.get('/compose-cloned/custom-path');
    strictEqual(response.status, 200);
    deepStrictEqual(response.body, { path: 'custom-path' });
  });
});
