import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { it, describe } from 'node:test';
import assert from 'node:assert/strict';
import { HttpException, type VovkReturnType } from 'vovk';
import { renderHook, act, waitFor } from '@testing-library/react';
import { CommonControllerRPC, WithZodClientControllerRPC, StreamingControllerRPC } from 'vovk-client';
import { JSDOM } from 'jsdom';
import { createElement, type ReactNode } from 'react';
import type { VovkYieldType } from 'vovk';

describe('useMutation', () => {
  it('Works with useMutation', async () => {
    const dom = new JSDOM();
    global.window = dom.window as unknown as typeof window;
    global.document = dom.window.document;

    const queryClient = new QueryClient();

    const { result } = renderHook(() => {
      return useMutation(CommonControllerRPC.postWithAll.mutationOptions(), queryClient);
    });

    await act(async () => {
      await result.current.mutate({
        params: { hello: 'world' },
        body: { isBody: true },
        query: { simpleQueryParam: 'queryValue' },
      });
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
        return useMutation(CommonControllerRPC.postWithAll.mutationOptions());
      },
      { wrapper }
    );

    await act(async () => {
      await result.current.mutate({
        params: { hello: 'world' },
        body: { isBody: true },
        query: { simpleQueryParam: 'queryValue' },
      });
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

  it('Validates on client', async () => {
    const queryClient = new QueryClient();

    const { result } = renderHook(() => {
      return useMutation(WithZodClientControllerRPC.handleBody.mutationOptions(), queryClient);
    });

    await act(async () => {
      await result.current.mutate({
        body: { hello: 'wrong_length' },
      });
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
      return useMutation(WithZodClientControllerRPC.handleBody.mutationOptions(), queryClient);
    });

    await act(async () => {
      await result.current.mutate({
        body: { hello: 'wrong_length' },
        disableClientValidation: true,
      });
    });
    await waitFor(() => {
      assert.ok(result.current.error);
    });
    assert.ok(result.current.error?.message.match(/Validation failed/));
    assert.strictEqual(result.current.error?.statusCode, 400);
    assert.ok(result.current.error instanceof HttpException);
  });

  it('Works with context client and JSONL stream', async () => {
    const queryClient = new QueryClient();

    const { result } = renderHook(() => {
      return useMutation(StreamingControllerRPC.postWithStreaming.mutationOptions(), queryClient);
    });

    await act(async () => {
      await result.current.mutate({
        body: [{ token: 'Hello' }, { token: ', ' }, { token: 'world' }, { token: '!' }],
        query: { query: 'queryValue' },
      });
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
});
