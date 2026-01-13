import type { OperationObject } from 'openapi3-ts/oas31';
import type { VovkToolOptions } from './tools.js';

export type VovkOperationObject = OperationObject & {
  'x-tool'?: VovkToolOptions;
};
