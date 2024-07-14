import { it, expect, describe } from '@jest/globals';

import vovkJson from '../../.vovk.json';

describe('Custom .vovk.json metadata', () => {
  it('Should write custom metadata', () => {
    expect(vovkJson.CostomMetadataController._handlers.getWithCustomMetadata.customMetadata.hello).toEqual('world');
  });
});
