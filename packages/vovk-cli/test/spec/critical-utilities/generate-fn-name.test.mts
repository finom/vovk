import assert from 'node:assert';
import { describe, it } from 'node:test';
import { HttpMethod } from 'vovk/internal';
import { generateFnName } from '../../../dist/utils/generate-fn-name.mjs';

const isIdentifier = (name: string) => /^[\p{L}_$][\p{L}\p{Nd}_$]*$/u.test(name);

await describe('generateFnName', async () => {
  const cases: [method: HttpMethod, path: string, name: string][] = [
    [HttpMethod.GET, '/users', 'listUsers'],
    [HttpMethod.GET, '/users/{id}', 'getUsersById'],
    [HttpMethod.POST, '/users', 'createUsers'],
    [HttpMethod.PUT, '/users/{id}', 'updateUsersById'],
    [HttpMethod.PATCH, '/users/{userId}/profile', 'patchUsersProfileByUserId'],
    [HttpMethod.DELETE, '/v1/api/orders/{orderId}', 'deleteV1OrdersByOrderId'],
    [HttpMethod.GET, '/users/{userId}/posts/{postId}', 'getUsersPostsByUserIdPostId'],
    [HttpMethod.GET, '/', 'list'],
    [HttpMethod.HEAD, '/users', 'headUsers'],
    [HttpMethod.OPTIONS, '/users', 'optionsUsers'],
  ];

  for (const [method, path, name] of cases) {
    await it(`Names ${method} ${path} "${name}"`, () => {
      assert.strictEqual(generateFnName(method, path), name);
    });
  }

  await it('Treats only a whole {segment} as a path param', () => {
    assert.strictEqual(generateFnName(HttpMethod.GET, '/users/id'), 'listUsersId');
    assert.notStrictEqual(generateFnName(HttpMethod.GET, '/users/id'), generateFnName(HttpMethod.GET, '/users/{id}'));
  });

  await it('Reads a param embedded in a segment', () => {
    assert.strictEqual(generateFnName(HttpMethod.GET, '/files/{name}.json'), 'getFilesJsonByName');
  });

  await it('Returns an identifier for any path', () => {
    const names = [
      generateFnName(HttpMethod.GET, '/user-profiles/{id}'),
      generateFnName(HttpMethod.POST, '/users/{user_id}/avatar.png'),
      generateFnName(HttpMethod.GET, '/2fa/{code}'),
      generateFnName(HttpMethod.GET, '/search:batch'),
      generateFnName(HttpMethod.GET, '/~user/{id}'),
    ];
    assert.deepStrictEqual(names, [
      'getUserProfilesById',
      'createUsersAvatarPngByUserId',
      'get2faByCode',
      'listSearchBatch',
      'getUserById',
    ]);
    for (const name of names) assert.ok(isIdentifier(name), name);
  });

  await it('Names a method missing from the verb map after the method itself', () => {
    assert.strictEqual(generateFnName('TRACE' as HttpMethod, '/users'), 'traceUsers');
  });
});
