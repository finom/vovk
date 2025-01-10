import { it, expect, describe } from '@jest/globals';
import StaticApiController from './StaticApiController';
import { generateStaticAPI } from 'vovk';

describe('Static JSON API', () => {
  it('Generates static API', () => {
    const staticAPI = generateStaticAPI({ controllers: StaticApiController });
    const staticAPIWithCustomSlug = generateStaticAPI({ controllers: StaticApiController }, 'custom');

    expect(staticAPI).toEqual([
      { vovk: ['_schema_'] },
      { vovk: ['static-api', 'endpoint-one'] },
      { vovk: ['static-api', 'endpoint-two'] },
    ]);

    expect(staticAPIWithCustomSlug).toEqual([
      { custom: ['_schema_'] },
      { custom: ['static-api', 'endpoint-one'] },
      { custom: ['static-api', 'endpoint-two'] },
    ]);
  });
});
