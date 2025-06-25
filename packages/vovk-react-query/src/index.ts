import {
  createRPC as originalCreateRPC,
  fetcher as defaultFetcher,
  type HttpException,
  type KnownAny,
  type VovkDefaultFetcherOptions,
  type VovkControllerSchema,
  type VovkReturnType,
  type VovkHandlerSchema,
  type VovkStreamAsyncIterable,
  type VovkSchema,
  type VovkSegmentSchema,
  type VovkClientFetcher,
} from 'vovk';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
  type QueryClient,
} from '@tanstack/react-query';

const withUseQuery = <
  T extends ((arg: KnownAny) => KnownAny) & {
    schema: VovkHandlerSchema;
    controllerSchema: VovkControllerSchema;
    segmentSchema: VovkSegmentSchema;
    fullSchema: VovkSchema;
  },
>(
  fn: T
) => {
  return Object.assign(fn, {
    useQuery: (input: Parameters<T>[0], options?: UseQueryOptions<ReturnType<T>>, queryClient?: QueryClient) => {
      queryClient = queryClient ?? useQueryClient();
      const queryKey = [
        fn.segmentSchema.segmentName,
        fn.controllerSchema.prefix,
        fn.controllerSchema.rpcModuleName,
        fn.schema.path,
        fn.schema.httpMethod,
        input,
      ];
      return useQuery(
        {
          queryFn: async () => {
            const result = await fn(input);
            if (Symbol.asyncIterator in result) {
              void (async () => {
                for await (const chunk of result) {
                  queryClient.setQueryData(queryKey, (data: unknown[]) => [...data, chunk]);
                }
              })();

              return [];
            }

            return result;
          },
          queryKey,
          ...options,
        },
        queryClient
      );
    },
    useMutation: (options?: UseMutationOptions<ReturnType<T>>, queryClient?: QueryClient) => {
      return useMutation(
        {
          mutationFn: fn,
          ...options,
        },
        queryClient
      );
    },
  });
};

// Add utility type to check if all properties are optional
type AllOptional<T> = object extends T ? true : false;

export function createRPC<T, OPTS extends Record<string, KnownAny> = KnownAny>(
  fullSchema: VovkSchema,
  segmentName: string,
  rpcModuleName: string,
  fetcher: VovkClientFetcher<OPTS> = defaultFetcher,
  options?: VovkDefaultFetcherOptions<OPTS>
) {
  const RPC = originalCreateRPC<T, OPTS>(fullSchema, segmentName, rpcModuleName, fetcher, options);

  // TODO: Refactor
  type ClientWithQuery = {
    [Key in keyof typeof RPC]: (typeof RPC)[Key] & {
      useQuery: AllOptional<Parameters<(typeof RPC)[Key]>[0]> extends true
        ? (
            input?: Parameters<(typeof RPC)[Key]>[0],
            options?: Omit<UseQueryOptions<ReturnType<(typeof RPC)[Key]>>, 'queryFn' | 'queryKey'>,
            queryClient?: QueryClient
          ) => VovkReturnType<(typeof RPC)[Key]> extends VovkStreamAsyncIterable<infer U>
            ? ReturnType<typeof useQuery<U[], HttpException>>
            : ReturnType<typeof useQuery<VovkReturnType<(typeof RPC)[Key]>, HttpException>>
        : (
            input: Parameters<(typeof RPC)[Key]>[0],
            options?: Omit<UseQueryOptions<ReturnType<(typeof RPC)[Key]>>, 'queryFn' | 'queryKey'>,
            queryClient?: QueryClient
          ) => VovkReturnType<(typeof RPC)[Key]> extends VovkStreamAsyncIterable<infer U>
            ? ReturnType<typeof useQuery<U[], HttpException>>
            : ReturnType<typeof useQuery<VovkReturnType<(typeof RPC)[Key]>, HttpException>>;
      useMutation: (
        options?: Omit<UseMutationOptions<ReturnType<(typeof RPC)[Key]>>, 'mutationFn'>,
        queryClient?: QueryClient
      ) => ReturnType<
        typeof useMutation<VovkReturnType<(typeof RPC)[Key]>, HttpException, Parameters<(typeof RPC)[Key]>[0]>
      >;
    };
  };

  return Object.fromEntries(
    Object.entries(RPC).map(([key, value]) => [key, withUseQuery(value as KnownAny)])
  ) as unknown as ClientWithQuery;
}
