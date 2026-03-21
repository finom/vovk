import { it, describe } from 'node:test';
import { deepStrictEqual, strictEqual } from 'node:assert';
import { request } from '../lib.ts';
import DecorateClassController, { DecorateClonedController } from './DecorateClassController.ts';
import DecorateController from './DecorateController.ts';

describe('decorate function', () => {
  const names = ['get', 'post', 'put', 'patch', 'del'] as const;

  for (const name of names) {
    it(`Should handle ${name} requests via decorate`, async () => {
      const response = await request[name]('/decorate');
      strictEqual(response.status, 200);
      deepStrictEqual(response.body, { method: name });
    });
  }

  it('Should handle head via decorate', async () => {
    const response = await request.head('/decorate');
    strictEqual(response.status, 200);
    strictEqual(response.headers['x-head-header'], 'head');
  });

  it('Should handle options via decorate', async () => {
    const response = await request.options('/decorate');
    strictEqual(response.status, 200);
    strictEqual(response.headers['x-options-header'], 'options');
  });

  it('Should handle custom path via decorate', async () => {
    const response = await request.get('/decorate/custom-path');
    strictEqual(response.status, 200);
    deepStrictEqual(response.body, { path: 'custom-path' });
  });

  it('Should handle decorator header via decorate', async () => {
    const response = await request.get('/decorate/get-with-header');
    strictEqual(response.status, 200);
    strictEqual(response.headers['x-decorator-header'], 'hello');
  });

  it('Should handle CORS via decorate', async () => {
    const response = await request.get('/decorate/get-with-cors');
    strictEqual(response.status, 200);
    strictEqual(response.headers['access-control-allow-origin'], '*');
  });

  it('Should handle before via decorate', async () => {
    const response = await request.get('/decorate/get-with-before');
    strictEqual(response.status, 200);
    deepStrictEqual(response.body, { before: true });
  });

  it('Should handle custom decorator via decorate', async () => {
    const response = await request.get('/decorate/get-with-custom-decorator');
    strictEqual(response.status, 200);
    deepStrictEqual(response.body, { hello: 'world' });
  });
});

describe('decorate function (class-level)', () => {
  it('Should handle class-level decorate with prefix', async () => {
    const response = await request.get('/decorate-class');
    strictEqual(response.status, 200);
    deepStrictEqual(response.body, { method: 'get', source: 'decorate-class' });
  });

  it('Should handle class-level decorate with prefix and custom path', async () => {
    const response = await request.get('/decorate-class/with-path');
    strictEqual(response.status, 200);
    deepStrictEqual(response.body, { path: 'with-path', source: 'decorate-class' });
  });

  it('Should handle class-level decorate with cloneControllerMetadata', async () => {
    // DecorateClonedController clones from DecorateController and has prefix 'decorate-cloned'
    // It inherits all handlers from DecorateController
    const response = await request.get('/decorate-cloned');
    strictEqual(response.status, 200);
    deepStrictEqual(response.body, { method: 'get' });
  });

  it('Should handle cloned controller custom path', async () => {
    const response = await request.get('/decorate-cloned/custom-path');
    strictEqual(response.status, 200);
    deepStrictEqual(response.body, { path: 'custom-path' });
  });

  it('Should preserve class .name through decorate', () => {
    strictEqual(DecorateController.name, 'DecorateController');
    strictEqual(DecorateClassController.name, 'DecorateClassController');
    strictEqual(DecorateClonedController.name, 'DecorateClonedController');
  });
});
