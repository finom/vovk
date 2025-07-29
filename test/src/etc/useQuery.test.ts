import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { it, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { HttpException, type VovkReturnType, type VovkYieldType } from 'vovk';
import { renderHook, waitFor } from '@testing-library/react';
import { CommonControllerRPC, StreamingControllerRPC, WithZodClientControllerRPC } from 'vovk-client';
import { JSDOM } from 'jsdom';
import { createElement, type ReactNode } from 'react';

before(() => {
  const dom = new JSDOM();
  global.window = dom.window as unknown as typeof window;
  global.document = dom.window.document;
});

describe('useQuery', () => {
  it('Works with custom client', async () => {
    const queryClient = new QueryClient();

    const { result } = renderHook(() => {
      const x = CommonControllerRPC.postWithAll.queryOptions(
        {
          params: { hello: 'world' },
          body: { isBody: true },
          query: { simpleQueryParam: 'queryValue' },
        },
        { experimental_prefetchInRender: true } // Uncomment if you want to test prefetching
      );
      return useQuery(x, queryClient);
    });

    await waitFor(() => {
      assert.equal(result.current.isSuccess, true);
    });

    assert.deepEqual(result.current.data satisfies VovkReturnType<typeof CommonControllerRPC.postWithAll> | undefined, {
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
        return useQuery(
          CommonControllerRPC.postWithAll.queryOptions({
            params: { hello: 'world' },
            body: { isBody: true },
            query: { simpleQueryParam: 'queryValue' },
          }),
          queryClient
        );
      },
      { wrapper }
    );

    await waitFor(() => {
      assert.equal(result.current.isSuccess, true);
    });

    assert.deepEqual(result.current.data satisfies VovkReturnType<typeof CommonControllerRPC.postWithAll> | undefined, {
      params: { hello: 'world' },
      body: { isBody: true },
      query: { simpleQueryParam: 'queryValue' },
    });
  });

  it('Works with context client and JSONL stream', async () => {
    const queryClient = new QueryClient();

    const { result } = renderHook(() => {
      return useQuery(
        StreamingControllerRPC.postWithStreaming.queryOptions(
          {
            body: [{ token: 'Hello' }, { token: ', ' }, { token: 'world' }, { token: '!' }],
            query: { query: 'queryValue' },
          },
          { experimental_prefetchInRender: true }
        ),
        queryClient
      );
    });

    await waitFor(() => {
      assert.equal(result.current.isSuccess, true);
    });

    assert.deepEqual(
      result.current.data satisfies VovkYieldType<typeof StreamingControllerRPC.postWithStreaming>[] | undefined,
      [
        {
          token: 'Hello',
          query: 'queryValue',
        },
      ]
    );

    await new Promise((resolve) => setTimeout(resolve, 1500));

    assert.deepEqual(result.current.data, [
      { token: 'Hello', query: 'queryValue' },
      { token: ', ', query: 'queryValue' },
      { token: 'world', query: 'queryValue' },
      { token: '!', query: 'queryValue' },
    ]);
  });

  it('OK with Zod', async () => {
    const queryClient = new QueryClient();

    const { result } = renderHook(() => {
      return useQuery(
        WithZodClientControllerRPC.handleBody.queryOptions(
          {
            body: { hello: 'world' },
          },
          { experimental_prefetchInRender: true }
        ),
        queryClient
      );
    });

    await waitFor(() => {
      assert.equal(result.current.isSuccess, true);
    });

    assert.deepEqual(result.current.data satisfies { hello: string } | undefined, { hello: 'world' });
  });

  it('Validates on client', async () => {
    const queryClient = new QueryClient();

    const { result } = renderHook(() => {
      return useQuery(
        WithZodClientControllerRPC.handleBody.queryOptions(
          {
            body: { hello: 'wrong_length' },
          },
          { experimental_prefetchInRender: true }
        ),
        queryClient
      );
    });

    await waitFor(() => {
      assert.ok(result.current.error);
    });

    assert.ok(result.current.error?.message.match(/Ajv validation failed/));
    assert.strictEqual(result.current.error?.statusCode, 0);
    assert.ok(result.current.error instanceof HttpException);
  });

  it('Validates on server', async () => {
    const queryClient = new QueryClient();

    const { result } = renderHook(() => {
      return useQuery(
        WithZodClientControllerRPC.handleBody.queryOptions(
          {
            body: { hello: 'wrong_length' },
            disableClientValidation: true,
          },
          { experimental_prefetchInRender: true }
        ),
        queryClient
      );
    });

    await waitFor(() => {
      assert.ok(result.current.error);
    });

    assert.ok(result.current.error?.message.match(/Validation failed/));
    assert.strictEqual(result.current.error?.statusCode, 400);
    assert.ok(result.current.error instanceof HttpException);
  });
});
