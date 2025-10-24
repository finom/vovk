import { createFetcher } from 'vovk';

export const fetcher = createFetcher<{
  successMessage: string;
}>({
  prepareRequestInit: (init, { successMessage }) => {
    return {
      ...init,
      headers: {
        ...init.headers,
        'x-vovk-fetcher-header': 'my-header-value',
        'x-success-message': successMessage,
      },
    };
  },
  transformResponse: (responseData, { successMessage }, { response, init, schema }) => {
    return {
      ...(responseData as object),
      successMessage,
      response,
      init,
      schema,
    };
  },
});
