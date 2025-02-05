import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { it, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { VovkReturnType } from 'vovk';
import { renderHook, waitFor } from '@testing-library/react';
import { ClientControllerRPC } from '../../../test/node_modules/.vovk-client/module.mjs';
import { JSDOM } from 'jsdom';
import { createElement, ReactNode } from 'react';

/**
TODO:
- stream
- useMutation context
- validation zod
- validation yup
- validation class-validator
 */

before(() => {
  const dom = new JSDOM();
  global.window = dom.window as unknown as typeof window;
  global.document = dom.window.document;
});

describe('useQuery', () => {
  it('Works with custom client', async () => {
    const queryClient = new QueryClient();

    const { result } = renderHook(() => {
      return ClientControllerRPC.postWithAll.useQuery(
        {
          params: { hello: 'world' },
          body: { isBody: true },
          query: { simpleQueryParam: 'queryValue' },
        },
        { experimental_prefetchInRender: true },
        queryClient
      );
    });

    await waitFor(() => {
      assert.equal(result.current.isSuccess, true);
    });

    assert.deepEqual(result.current.data satisfies VovkReturnType<typeof ClientControllerRPC.postWithAll> | undefined, {
      params: { hello: 'world' },
      body: { isBody: true },
      query: { simpleQueryParam: 'queryValue' },
    });
  });

  it('Works with context client', async () => {
    const queryClient = new QueryClient();

    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(
        QueryClientProvider,
        {
          client: queryClient,
        },
        children
      );
    const { result } = renderHook(
      () => {
        return ClientControllerRPC.postWithAll.useQuery({
          params: { hello: 'world' },
          body: { isBody: true },
          query: { simpleQueryParam: 'queryValue' },
        });
      },
      { wrapper }
    );

    await waitFor(() => {
      assert.equal(result.current.isSuccess, true);
    });

    assert.deepEqual(result.current.data satisfies VovkReturnType<typeof ClientControllerRPC.postWithAll> | undefined, {
      params: { hello: 'world' },
      body: { isBody: true },
      query: { simpleQueryParam: 'queryValue' },
    });
  });
});
