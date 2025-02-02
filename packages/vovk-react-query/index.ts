import {
  createRPC,
  HttpException,
  type VovkClientOptions,
  type VovkDefaultFetcherOptions,
  type VovkControllerSchema,
  type KnownAny,
  type VovkClient,
  type VovkReturnType,
} from 'vovk';

import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

const withUseQuery = <T extends (...args: KnownAny[]) => KnownAny>(fn: T) => {
  return Object.assign(fn, {
    useQuery: (options: UseQueryOptions<ReturnType<T>>) => {
      return useQuery({
        queryFn: fn,
        ...options,
      });
    },
    useMutation: (options: UseMutationOptions<ReturnType<T>>) => {
      return useMutation({
        mutationFn: fn,
        ...options,
      });
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
          Omit<UseQueryOptions<ReturnType<VovkClient<T, OPTS>[Key]>>, 'queryFn'>
      ) => ReturnType<typeof useQuery<VovkReturnType<VovkClient<T, OPTS>[Key]>, HttpException>>;
      useMutation: (
        options?: Omit<UseMutationOptions<ReturnType<VovkClient<T, OPTS>[Key]>>, 'mutationFn'>
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
