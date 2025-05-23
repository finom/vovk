// auto-generated 2025-05-23T18:21:43.663Z
/* eslint-disable */
import type { VovkClientFetcher } from 'vovk';
import { fetcher } from 'vovk';
import { createRPC } from 'vovk';
import { schema } from './schema.ts';


import { validateOnClient } from '../../../../packages/vovk-ajv/index.js';

type Options = typeof fetcher extends VovkClientFetcher<infer U> ? U : never;

export { schema };