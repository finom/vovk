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
      ...responseData,
      fetcherExtraProperty: 'my-extra-value',
    };
  },
});
