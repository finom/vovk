import { QueryClient } from '@tanstack/react-query';
import { it, describe } from 'node:test';
import assert from 'node:assert/strict';
import { VovkReturnType } from 'vovk';
import { renderHook, waitFor } from '@testing-library/react';
import { ClientControllerRPC } from '../../../test/node_modules/.vovk-client/compiled.js';
import { JSDOM } from 'jsdom';

describe('useQuery', () => {
  it('Works with useQuery', async () => {
    const dom = new JSDOM();
    global.window = dom.window as unknown as typeof window;
    global.document = dom.window.document;

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false }, // Disable retries for tests
      },
    });

    const { result } = renderHook(() => {
      return ClientControllerRPC.postWithAll.useQuery(
        {
          queryKey: ['postWithAll'],
          params: { hello: 'world' },
          body: { isBody: true },
          query: { simpleQueryParam: 'queryValue' },
          experimental_prefetchInRender: true,
        },
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
});
