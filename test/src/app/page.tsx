'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { ClientControllerRPC } from 'vovk-client';

const queryClient = new QueryClient();

const UseQueryComponent = () => {
  const useQueryResult = ClientControllerRPC.postWithAll.useQuery(
    {
      queryKey: ['postWithAll'],
      params: { hello: 'world' },
      body: { isBody: true },
      query: { simpleQueryParam: 'queryValue' },
      experimental_prefetchInRender: true,
    },
    queryClient
  );

  useEffect(() => {
    (
      window as typeof window & {
        useQueryResult: typeof useQueryResult;
      }
    ).useQueryResult = useQueryResult;
  }, [useQueryResult]);

  return null;
};

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <UseQueryComponent />
    </QueryClientProvider>
  );
}
