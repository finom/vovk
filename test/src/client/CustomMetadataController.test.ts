import { it, expect, describe } from '@jest/globals';
import segmentsMetadata from '../../.vovk-schema';

describe('Custom .vovk.json metadata', () => {
  it('Should write custom metadata', () => {
    expect(
      segmentsMetadata['foo/client'].controllers.CostomMetadataController._handlers.getWithCustomMetadata.customMetadata
        ?.hello
    ).toEqual('world');
  });
});
