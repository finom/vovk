import {
  createRPC,
  HttpException,
  type KnownAny,
  type VovkClientOptions,
  type VovkDefaultFetcherOptions,
  type VovkControllerSchema,
  type VovkClient,
  type VovkReturnType,
} from 'vovk';

import { useQuery, useMutation, UseQueryOptions, UseMutationOptions, QueryClient } from '@tanstack/react-query';

const withUseQuery = <T extends (...args: KnownAny[]) => KnownAny>(fn: T) => {
  return Object.assign(fn, {
    useQuery: (options: UseQueryOptions<ReturnType<T>>, queryClient?: QueryClient) => {
      return useQuery(
        {
          queryFn: () => fn(options),
          ...options,
        },
        queryClient
      );
    },
    useMutation: (options: UseMutationOptions<ReturnType<T>>, queryClient?: QueryClient) => {
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

export default function createRPCWithUseQuery<T, OPTS extends Record<string, KnownAny> = VovkDefaultFetcherOptions>(
  controllerSchema: VovkControllerSchema,
  segmentName?: string,
  options?: VovkClientOptions<OPTS>
) {
  const rpc = createRPC<T, OPTS>(controllerSchema, segmentName, options);

  type ClientWithQuery = {
    [Key in keyof VovkClient<T, OPTS>]: VovkClient<T, OPTS>[Key] & {
      useQuery: (
        options: Parameters<VovkClient<T, OPTS>[Key]>[0] &
          Omit<UseQueryOptions<ReturnType<VovkClient<T, OPTS>[Key]>>, 'queryFn'>,
        queryClient?: QueryClient
      ) => ReturnType<typeof useQuery<VovkReturnType<VovkClient<T, OPTS>[Key]>, HttpException>>;
      useMutation: (
        options?: Omit<UseMutationOptions<ReturnType<VovkClient<T, OPTS>[Key]>>, 'mutationFn'>,
        queryClient?: QueryClient
      ) => ReturnType<
        typeof useMutation<
          VovkReturnType<VovkClient<T, OPTS>[Key]>,
          HttpException,
          Parameters<VovkClient<T, OPTS>[Key]>[0]
        >
      >;
    };
  };

  return Object.fromEntries(
    Object.entries(rpc).map(([key, value]) => [key, withUseQuery(value as KnownAny)])
  ) as unknown as ClientWithQuery;
}
