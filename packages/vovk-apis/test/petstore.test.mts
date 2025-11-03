import assert from 'node:assert';
import { test, describe } from 'node:test';
import { type Mixins, PetstoreAPI, schema, openapi } from '../dist/petstore/index.mjs';

describe('Petstore', () => {
  test('PetstoreAPI and Mixins', async () => {
    const pet = await PetstoreAPI.addPet({
      body: {
        id: 123,
        name: 'Doggie',
        photoUrls: ['http://example.com/photo1'],
        tags: [{ id: 1, name: 'tag1' }],
        status: 'available',
      },
    });
    assert.equal(pet.name, 'Doggie');
    pet satisfies Mixins.Petstore.Pet;
  });

  test('schema', async () => {
    assert(schema);
    assert(schema.segments.petstore);
    assert(schema.segments.petstore.emitSchema);
    assert(schema.segments.petstore.segmentType === 'mixin');
  });

  test('openapi', async () => {
    assert.equal(openapi.info.title, 'Swagger Petstore - OpenAPI 3.0');
  });
});
