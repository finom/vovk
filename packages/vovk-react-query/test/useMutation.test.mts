import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { it, describe } from 'node:test';
import assert from 'node:assert/strict';
import { KnownAny, VovkReturnType } from 'vovk';
import { renderHook, act } from '@testing-library/react';
import { ClientControllerRPC } from '../../../test/node_modules/.vovk-client/compiled.js';
import { JSDOM } from 'jsdom';
import { set } from 'lodash';

describe('useMutation', () => {
  it('Works with useMutation', async () => {
    const dom = new JSDOM();
    // @ts-ignore
    global.window = dom.window;
    // @ts-ignore
    global.document = dom.window.document;

    const queryClient = new QueryClient();

    const { result } = renderHook(() => {
      return ClientControllerRPC.postWithAll.useMutation({}, queryClient);
    });

    await act(async () => {
      await result.current.mutate({
        params: { hello: 'world' },
        body: { isBody: true },
        query: { simpleQueryParam: 'queryValue' },
      });
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    assert.deepEqual(result.current.data satisfies VovkReturnType<typeof ClientControllerRPC.postWithAll> | undefined, {
      params: { hello: 'world' },
      body: { isBody: true },
      query: { simpleQueryParam: 'queryValue' },
    });
  });
});
