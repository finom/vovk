# Request validation

**Vovk.ts** offers API that allows to validate request body and query string on back-end and, thanks to the metadata mechanism, performs zero-cost validation on client-side before request to the server is even made.

## vovk-zod

**vovk-zod** is the library that implements Zod validation of query and body on server-side, converts /////////

## Creating a custom validation library

Please check `createDecorator` /////// and client //// documentation before moving forward.

You can create a decorator that, first of all, validates request on the server-side and optionally populates controller metadata with validation information that is going to be used by `fetcher` and `streamFetcher` when they call `validate` function. 

The simplest example of the validation would be equality validation. It does nothing than checking if received query and body are equal to some definite object.

At the example below `validateEquality` decorator is created with `createDecorator` that accepts 2 arguments: server validation function and init function that uses `clientValidators` object to indicate that validation information should be stored at metadata file.

```ts
// lib/validateEquality.ts
import { isEqual } from 'lodash';
import { HttpException, HttpStatus, createDecorator, type VovkRequest } from 'vovk';
import type { VovkClientOptions } from 'vovk/client';

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

export const validateEqualityOnClient: VovkClientOptions['validateOnClient'] = (input, validators) => {
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

export default validateEquality;
```

Another exported variable is `validateEqualityOnClient` that implements `VovkClientOptions['validateOnClient']` type. It's role is to define how validation is performed on client-side. In other words `validateEquality` is used as a controller decorator and `validateEqualityOnClient` is used by `clientizeController` as a `validateOnClient` option. Also notice that `validateEqualityOnClient` throws `HttpException` with status 0 to simulate regular HTTP exceptions that can be caught by the client-side code.

Here is how the newly created decorator is used at controller.

```ts
// vovk/hello/HelloController.ts
import type { VovkRequest } from 'vovk';
import validateEquality from '../lib/validateEquality';

export default class HelloController {
    static controllerName = 'HelloController';

    @post.auto()
    @validateEquality({ foo: 42 }, { bar: 'hello' })
    static validatedRequest(req: VovkRequest<{ foo: 42 }, { bar: 'hello' }>) {
        // ...
    }
}
```

In your state file you need to import `validateEqualityOnClient` and pass it to `clientizeController` as an option.

```ts
// vovk/hello/HelloState.ts
import { clientizeController } from 'vovk/client';
import type HelloController from './HelloController';
import { validateEqualityOnClient } from '../lib/validateEquality';
import metadata from '../vovk-metadata.json' assert { type: 'json' };

type HelloControllerType = typeof HelloController;

const controller = clientizeController<HelloControllerType>(metadata.HelloController, {
    validateOnClient: validateEqualityOnClient,
    disableClientValidation: false, // optionally set to true to disable client validation 
});

const helloState = {
    validatedRequest: async (hello: string, foo: string) => {
        const result = await controller.validatedRequest({
            body: { foo: 42 },
            query: { bar: 'hello' },
        });

        return result;
    }
}
```

`validateOnClient` is going to be invoked on every request before data is sent to the server.

## Disable client validation

You can set `disableClientValidation` option mentioned above to `true` to disable client validation for debugging purposes. If you want to disable it completely and remove it from the metadata file (in case if you want to hide server-side validation implementation) you can use `exposeValidation` option set to `false` at the Next.js wildcard router level.

```ts
// api/[[...]]/route.ts
// ...
export const { GET, POST, PATCH, PUT} = initVovk(controllers, {
    exposeValidation: false // don't populate metadata file with validation information
    onMetadata: // ...
});
```



