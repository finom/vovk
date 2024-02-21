---
sidebar_position: 7
---

# Customization

## vovk.config.js

The config file allows to change default options in order to customise generated client or its path. The default config looks like that: 

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

- `clientOut` - where the client is going to be compiled to. Can be overriden by `VOVK_CLIENT_OUT` env variable.
- `route` - allows to redefine path to the wildcard route (the slug can be any non-empty string, it's name is not utilised by Vovk.ts). Can be overriden by `VOVK_ROUTE` env variable.
- `fetcher` - allows to customize the fetching function that used internally by the client. Can be overriden by `VOVK_FETCHER` env variable. See the next section for more info. 
- `prefix` - defines the root endpoint used by `fetch` function at the client. Can be overriden by `VOVK_PREFIX` env variable.
- `validateOnClient` - defines client-side validation library. If [vovk-zod](https://github.com/finom/vovk-zod) is installed but `validateOnClient` is not redefined it's value going to get value `vovk-zod/zodValidateOnClient`. Can be overriden by `VOVK_VALIDATE_ON_CLIENT` env variable.

## Customizing fetcher and default client options

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

As you can see the code determines response type by `content-type` header. You can freely redefine this logic to make the fetcher return something else.

```ts
if (response.headers.get('content-type')?.includes('application/json')) {
  return yourCustomHandler(response);
}
```

In case if server response and `yourCustomHandler` returns different value (for example, model ID instead of an object), you can redefine its type using client method generic.

```ts
import { MyController } from 'vovk-client';

// ...

const result = MyController.myMethod<{ foo: 'bar' }>({
  body,
  successMessage: 'Success!'
})
```

The `result` variable from this example is going to receive `{ foo: 'bar' }` type.

## Creating a custom validation library

You can create a decorator that, first of all, validates request on the server-side and optionally populates controller metadata with validation information that is going to be used by the client.

The simplest example of the validation would be equality validation. It does nothing than checking if received query and body are equal to some definite object but has no practical use outside of this documentation.

At the example below `validateEquality` decorator is created with `createDecorator` that accepts 2 arguments: server validation function and init function that uses `clientValidators` object to indicate that validation information should be stored at **.vovk.json** file.

```ts
// /src/decorators/validateEquality.ts
import { isEqual } from 'lodash';
import { 
  HttpException, HttpStatus, createDecorator, type VovkRequest, type VovkClientOptions 
} from 'vovk';

type BodyValidate = Record<string, unknown> | null;
type QueryValidate = Record<string, string> | null;

const validateEquality = createDecorator(
  async (req: VovkRequest<unknown>, next, bodyValidate?: BodyValidate, queryValidate?: QueryValidate) => {
    if (bodyValidate) {
      const body = await req.json();

      // override req.json to make it to be called again by controller code
      req.json = () => Promise.resolve(body);

      if (!isEqual(body, bodyValidate)) {
        throw new HttpException(HttpStatus.BAD_REQUEST, 'Server exception. Invalid body');
      }
    }

    if (queryValidate) {
      const query = Object.fromEntries(req.nextUrl.searchParams.entries());

      if (!isEqual(query, queryValidate)) {
        throw new HttpException(HttpStatus.BAD_REQUEST, 'Server exception. Invalid query');
      }
    }

    return next();
  },
  (bodyValidate?: BodyValidate, queryValidate?: QueryValidate) => ({
    clientValidators: {
      body: bodyValidate,
      query: queryValidate,
    },
  })
);

export default validateEquality;
```

Then create a file that defines client-side validation function as default export. 

```ts
// /src/decorators/validateEqualityOnClient.ts
import { type VovkClientOptions, HttpException, HttpStatus } from 'vovk';
import { isEqual } from 'lodash';

// /src/decorators/validateEqualityOnClient.ts
const validateEqualityOnClient: VovkClientOptions['validateOnClient'] = (input, validators) => {
  if (validators.body) {
    if (!isEqual(input.body, validators.body)) {
      throw new HttpException(HttpStatus.NULL, `Client exception. Invalid body`);
    }
  }

  if (validators.query) {
    if (!isEqual(input.query, validators.query)) {
      throw new HttpException(HttpStatus.NULL, `Client exception. Invalid query`);
    }
  }
};

export default validateEqualityOnClient;
```

At this example `validateEquality` is used as a controller decorator and `validateEqualityOnClient` is used by the client. Also notice that `validateEqualityOnClient` throws `HttpException` with status `0` to simulate regular HTTP exceptions that can be caught by the client-side code.

Here is how the newly created decorator is used at controller.

```ts
// /src/modules/hello/HelloController.ts
import type { VovkRequest } from 'vovk';
import validateEquality from '../decorators/validateEquality';

export default class HelloController {
    @post.auto()
    @validateEquality({ foo: 42 }, { bar: 'hello' })
    static validatedRequest(req: VovkRequest<{ foo: 42 }, { bar: 'hello' }>) {
        // ...
    }
}
```

In order to enable client-side validation you need to define `validateOnClient` option in **vovk.config.js** file.

```js
/** @type {import('vovk').VovkConfig} */
const vovkConfig = {
    validateOnClient: `./src/decorators/validateEqualityOnClient`,
}

module.exports = vovkConfig;
```

If your validation library is published on NPM it needs to follow the same approach but use module name instead of local path to the file.

```js
/** @type {import('vovk').VovkConfig} */
const vovkConfig = {
    validateOnClient: `my-validation-library/validateEqualityOnClient`,
}

module.exports = vovkConfig;
```

Resulting client code is going to look like that:

```ts
import { HelloController } from 'vovk-client';

// ...

const result = await HelloController.validatedRequest({
    body: { foo: 42 },
    query: { bar: 'hello' },
});
```

`validateEqualityOnClient` is going to be invoked on every request before data is sent to the server.
