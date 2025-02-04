import {
  createRPC,
  HttpException,
  type KnownAny,
  type VovkClientOptions,
  type VovkDefaultFetcherOptions,
  type VovkControllerSchema,
  type VovkClient,
  type VovkReturnType,
  type VovkHandlerSchema,
} from 'vovk';

import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
  type QueryClient,
} from '@tanstack/react-query';

const withUseQuery = <
  T extends ((arg: KnownAny) => KnownAny) & { schema: VovkHandlerSchema; controllerSchema: VovkControllerSchema },
>(
  fn: T
) => {
  return Object.assign(fn, {
    useQuery: (input: Parameters<T>[0], options?: UseQueryOptions<ReturnType<T>>, queryClient?: QueryClient) => {
      return useQuery(
        {
          queryFn: () => {
            console.log('heck', fn, input);

            try {
              console.log('xxx');
              console.log(fn(input).then(console.log).catch(console.error));
              console.log('yyy') ;
            } catch (e) {
              console.error(e);
            }
            return fn(input);
          },
          queryKey: [
            fn.controllerSchema.prefix,
            fn.controllerSchema.controllerName,
            fn.schema.path,
            fn.schema.httpMethod,
            input,
          ],
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

export default function createRPCWithUseQuery<T, OPTS extends Record<string, KnownAny> = VovkDefaultFetcherOptions>(
  controllerSchema: VovkControllerSchema,
  segmentName?: string,
  options?: VovkClientOptions<OPTS>
) {
  const rpc = createRPC<T, OPTS>(controllerSchema, segmentName, options);

  type ClientWithQuery = {
    [Key in keyof VovkClient<T, OPTS>]: VovkClient<T, OPTS>[Key] & {
      useQuery: (
        input: Parameters<VovkClient<T, OPTS>[Key]>[0],
        options?: Omit<UseQueryOptions<ReturnType<VovkClient<T, OPTS>[Key]>>, 'queryFn' | 'queryKey'>,
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
