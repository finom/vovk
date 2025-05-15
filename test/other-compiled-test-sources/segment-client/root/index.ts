// auto-generated 2025-05-15T21:22:47.571Z
/* eslint-disable */
import type { VovkClientFetcher } from 'vovk';
import { fetcher } from 'vovk';
import { createRPC } from 'vovk';
import { schema } from './schema.ts';


import { validateOnClient } from '../../../../packages/vovk-ajv/index.js';

type Options = typeof fetcher extends VovkClientFetcher<infer U> ? U : never;

export { schema };