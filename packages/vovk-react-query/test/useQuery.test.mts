import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { it, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { HttpException, type VovkReturnType, type VovkYieldType } from 'vovk';
import { renderHook, waitFor } from '@testing-library/react';
import {
  ClientControllerRPC,
  StreamingControllerRPC,
  WithZodClientControllerRPC,
} from '../../../test/node_modules/vovk-client/module.mjs';
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

  it('Works with context client and JSONL stream', async () => {
    const queryClient = new QueryClient();

    const { result } = renderHook(() => {
      return StreamingControllerRPC.postWithStreaming.useQuery(
        {
          body: [{ token: 'Hello' }, { token: ', ' }, { token: 'world' }, { token: '!' }],
          query: { query: 'queryValue' },
        },
        { experimental_prefetchInRender: true },
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
      return WithZodClientControllerRPC.handleBody.useQuery(
        {
          body: { hello: 'world' },
        },
        { experimental_prefetchInRender: true },
        queryClient
      );
    });

    await waitFor(() => {
      assert.equal(result.current.isSuccess, true);
    });

    assert.deepEqual(result.current.data satisfies { hello: 'world' } | undefined, { hello: 'world' });
  });

  it('Validates on client', async () => {
    const queryClient = new QueryClient();

    const { result } = renderHook(() => {
      return WithZodClientControllerRPC.handleBody.useQuery(
        {
          body: { hello: 'wrong' as 'world' },
        },
        { experimental_prefetchInRender: true },
        queryClient
      );
    });

    await waitFor(() => {
      assert.ok(result.current.error);
    });

    assert.ok(
      result.current.error?.message.match(
        /Ajv validation failed\. Invalid body on client for http:\/\/.* data\/hello must be equal to constant/
      )
    );
    assert.strictEqual(result.current.error?.statusCode, 0);
    assert.ok(result.current.error instanceof HttpException);
  });

  it('Validates on server', async () => {
    const queryClient = new QueryClient();

    const { result } = renderHook(() => {
      return WithZodClientControllerRPC.handleBody.useQuery(
        {
          body: { hello: 'wrong' as 'world' },
          disableClientValidation: true,
        },
        { experimental_prefetchInRender: true },
        queryClient
      );
    });

    await waitFor(() => {
      assert.ok(result.current.error);
    });

    assert.ok(
      result.current.error?.message.match(
        /Zod validation failed\. Invalid body on server for http:\/\/.* Invalid literal value, expected "world" \(hello\)/
      )
    );
    assert.strictEqual(result.current.error?.statusCode, 400);
    assert.ok(result.current.error instanceof HttpException);
  });
});
