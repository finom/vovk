import { describe, it } from 'node:test';
import { strictEqual } from 'node:assert';
import { createRPC } from 'vovk/create-rpc';
import { createRPC as createRPCLegacy } from 'vovk/createRPC';
import { createValidateOnClient } from 'vovk/create-validate-on-client';
import { createValidateOnClient as createValidateOnClientLegacy } from 'vovk/createValidateOnClient';

// The camelCase subpaths remain as aliases of the kebab-case ones until the next major.
describe('kebab-case subpath aliases', () => {
  it('vovk/createRPC resolves to the same module as vovk/create-rpc', () => {
    strictEqual(createRPCLegacy, createRPC);
  });

  it('vovk/createValidateOnClient resolves to the same module as vovk/create-validate-on-client', () => {
    strictEqual(createValidateOnClientLegacy, createValidateOnClient);
  });
});
