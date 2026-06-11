import { it, describe } from 'node:test';
import { strictEqual, deepStrictEqual } from 'node:assert';
import { apiUrl, request } from '../lib.ts';

export const prefixes = ['trim-prefix-1', '/trim-prefix-2', 'trim-prefix-3/', '/trim-prefix-4/'];
export const endpoints = ['trim-endpoint-1', '/trim-endpoint-2', 'trim-endpoint-3/', '/trim-endpoint-4/'];

function trimPath(path: string) {
  let clean = path.startsWith('/') ? path.slice(1) : path;
  clean = clean.endsWith('/') ? clean.slice(0, -1) : clean;
  return clean;
}

describe('Trim endpoints', () => {
  for (const p of prefixes) {
    for (const e of endpoints) {
      it(`should trim prefix "${p}" and endpoint "${e}"`, async () => {
        const endpoint = `/${trimPath(p)}/${trimPath(e)}`;
        const response = await request.get(endpoint);
        strictEqual(response.status, 200);

        deepStrictEqual(response.body, { reqUrl: `${apiUrl}${endpoint}` });
      });
    }
  }
});
