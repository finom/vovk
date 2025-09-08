import assert from 'node:assert';
import { test, describe } from 'node:test';
import { type Mixins, GithubMetaRPC, schema, openapi } from '../dist/github/index.mjs';

describe('Github', () => {
  test('GithubMetaRPC and Mixins', async () => {
    const octocat = await GithubMetaRPC.root();
    assert.equal(octocat.current_user_url, 'https://api.github.com/user');
    octocat satisfies Mixins.Github.Root;
  });

  test('schema', async () => {
    assert(schema);
    assert(schema.segments.github);
    assert(schema.segments.github.emitSchema);
    assert(schema.segments.github.segmentType === 'mixin');
  });

  test('openapi', async () => {
    assert.equal(openapi.info.title, 'GitHub v3 REST API');
  });
});
