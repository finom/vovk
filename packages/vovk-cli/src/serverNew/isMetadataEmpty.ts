import { isEmpty } from 'lodash';
import type { VovkMetadata } from 'vovk';

export default function isMetadataEmpty(metadata: VovkMetadata): boolean {
  return isEmpty(metadata.controllers) && isEmpty(metadata.workers);
}
