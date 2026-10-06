import { HttpStatus } from 'vovk';
import { createFetcher } from 'vovk/fetcher';

export const fetcher = createFetcher<{ bypassRegistry?: boolean }>({
  onError: (error) => {
    // the Telegram mixin calls it on the server too, where there is no page to redirect
    if (
      error.statusCode === HttpStatus.UNAUTHORIZED &&
      typeof document !== 'undefined'
    ) {
      document.location.href = '/login';
    }
  },
});
