---
sidebar_position: 7
---

# Customization

## vovk.config.js

```ts
/** @type {import('vovk').VovkConfig} */
const vovkConfig = {
    clientOut: './node_modules/.vovk',
    route: './src/app/api/[[...vovk]]/route.ts',
    fetcher: 'vovk/client/defaultFetcher',
    prefix: '/api',
    validateOnClient: '',
};

module.exports = vovkConfig;
```

## Customize fetcher and default options

You can redefine the default fetching function with its option completely to tightly integrate with your application state or to add extra features. For example, the clientized controller methods may look like that:

```ts
import { UserController } from 'vovk-client';

// ...

UserController.createUser({ 
    body,
    query,
    successToast: 'Successfully created a new user',
    useAuth: true,
    sentryLogErrors: true,
});
```

The fetcher is defined as a default export that extends `VovkClientFetcher` type and should be listed either as config option:

```ts
/** @type {import('vovk').VovkConfig} */
const vovkConfig = {
    fetcher: './src/lib/myFetchingFunction',
};

module.exports = vovkConfig;
```

Or as `VOVK_FETCHER` env variable:

```sh
VOVK_FETCHER="./src/lib/myFetchingFunction" vovk dev
```

By default Vovk.ts uses fetcher defined at `vovk/client/defaultFetcher` and you can check its source code [here](https://github.com/finom/vovk/blob/main/src/client/defaultFetcher.ts). 

The fetcher accepts two arguments: 
- An object that is provided by internal Vovk.ts code that includes HTTP method information and utilities:
    - `httpMethod` - the HTTP metod;
    - `getEndpoint` - an utility that builds request endpoiint from `prefix`, `query` and `params`;
    - `validate` - a function that validates `body` and `query` of the request;
    - `defaultHandler` - handles the `Response` object returned from `fetch` function;
    - `defaultStreamHandler` - handles the `Response` object returned from `fetch` function in case of stream.
- Request arguments:
    - `params` - the patams such as `id` from `users/:id`;
    - `query` - the search query properties such as `?foo=bar`;
    - `body` - the request body;
    - `prefix` - what's defined as `prefix` property at **vovk.config.js** or passed directly to the client method;
    - The rest options - your custom options and `RequestInit` that includes the rest `fetch` options such as `headers`, `credentials` etc.

Your custom fetcher with custom option `myCustomOption` that is just alerted may look like that:

```ts
import type { VovkDefaultFetcherOptions, VovkClientFetcher } from 'vovk';

// in order to keep default features such as disableClientValidation, headers etc,
// it's recommended to extend custom options from VovkDefaultFetcherOptions
interface MyOptions extends VovkDefaultFetcherOptions {
    successMessage: string;
}

const myCustomFetcher: VovkClientFetcher<MyOptions> = async (
  { httpMethod, getEndpoint, validate, defaultHandler, defaultStreamHandler },
  { params, query, body, prefix = '/api', myCustomOption, ...options }
) => {
  // 1. Build the endpoint
  const endpoint = getEndpoint({ prefix, params, query });

  // 2. Validate
  if (!options.disableClientValidation) {
    await validate({ body, query });
  }

  // 3. Make fetch request (here you can add authorisation headers)
  const response = await fetch(endpoint, {
    method: httpMethod,
    body: JSON.stringify(body),
    ...options,
  });

  // 4. Utilise your custom option somehow
  alert(successMessage);

  // 5. Handle response based on response headers
  if (response.headers.get('content-type')?.includes('application/json')) {
    return defaultHandler(response);
  }

  if (response.headers.get('content-type')?.includes('text/event-stream')) {
    return defaultStreamHandler(response);
  }

  return response;
};

export default myCustomFetcher;
```

## Customize client validation library

Soon...