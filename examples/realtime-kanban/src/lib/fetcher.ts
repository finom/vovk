import { createFetcher, HttpStatus } from 'vovk';

export const fetcher = createFetcher<{ bypassRegistry?: boolean }>({
  onError: (error) => {
    if (error.statusCode === HttpStatus.UNAUTHORIZED) {
      document.location.href = '/login';
    }
  },
});
