import { createFetcher } from 'vovk';

export const fetcher = createFetcher({
  prepareRequestInit: (init) => {
    return {
      ...init,
      headers: {
        ...init.headers,
        'x-vovk-fetcher-header': 'my-header-value',
      },
    };
  },
  transformResponse: (responseData) => {
    return {
      ...(responseData as object),
      fetcherExtraProperty: 'my-extra-value',
    };
  },
});
