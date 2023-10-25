import { it, expect, describe } from '@jest/globals';
import supertest from 'supertest';
import { endpoints, prefixes } from './trimControllers';

const apiUrl = `http://localhost:${process.env.PORT}/api`;

const request = supertest(apiUrl);

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
        expect(response.status).toBe(200);

        expect(response.body).toStrictEqual({ reqUrl: `${apiUrl}${endpoint}` });
      });
    }
  }
});
