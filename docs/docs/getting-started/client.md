# Vovk Client

**vovk/client** module exports utilities that turn controllers in a well-typed TypeScript library. It recognises types imported with `import type` from controllers.


```ts
// vovk/hello/HelloController.ts - the back-end
import { post, type VovkRequest } from 'vovk';

export class HelloController {
    static controllerName = 'HelloController';

    @post('hello/:someParam')
    static postSomeData(req: VovkRequest<{ hello: number }, { foo: string }>, { someParam }: { someParam: string }) {
        const body = await req.json(); // casted as { hello: number }
        const foo = req.nextUrl.get('foo'); // casted as string
        const bar = req.nextUrl.get('bar'); // casted as never

        return {
            hello: body.hello,
            foo,
            someParam,
        }
    }
}
```

`clientizeController` accepts controller types and controller metadata as an input and returns fetching library. The fetching library consists all controller methods as well as type recognition for body, query, params and return type. It's worthy to mention that Proxy object isn't used here.

Vovk supports any application state library. At this example I'm going to use a simple object.

```ts
// vovk/hello/HelloState.ts - the front-end
import { clientizeController } from 'vovk/client';
import type HelloController from './HelloController';
import metadata from '../vovk-metadata.json' assert { type: 'json' };

type HelloControllerType = typeof HelloController;

const controller = clientizeController<HelloControllerType>(metadata.HelloController);

const helloState = {
    postSomeData: async (hello: string, foo: string) => {
        /* controller.postSomeData is casted as 
          ({
            body: { hello: number },
            query: { foo: string },
            params: { someParam: string }
          }) => Promise<{ hello: number; foo: string; someParam: string }>
        */
        const result = await controller.postSomeData({
            body: { hello: 42 },
            query: { foo: 'baz' },
            params: { someParam: 'param' }
        });

        // result is casted as { hello: string; foo: string; someParam: string }
        return result;
    }
}
```

`VovkRequest` also supports branded and flavoured types.

```ts
// vovk/hello/HelloController.ts
export type Hello = number & { __type: 'hello' };
export type Foo = string & { __type: 'foo' };

export class HelloController {
    // ...
    static postSomeData(req: VovkRequest<{ hello: Hello }, { foo: Foo }> // ...
    // ...
```

```ts
import type { default as HelloController, Hello, Foo } from './HelloController';

// ...
    /* controller.postSomeData is casted as 
        ({
            body: { hello: Hello },
            query: { foo: Foo },
            params: { someParam: string }
        }) => { hello: Hello; foo: Foo; someParam: string }
    */
    const result = await controller.postSomeData({
        body: { hello: 42 as Hello },
        query: { foo: 'baz' as Foo },
        params: { someParam: 'param' }
    });
// ...
```

## Overriding default fetch function

Almost every complex React project requires its own fetching implementation to interact with application state, show success and error messages, log errors to a third-party service such as Sentry. `clientizeController` provides a set of options, and one of them is `fetcher` that overrides the default fetcher that's provided out of the box.

```ts
// vovk/hello/HelloState.ts
import { myCustomFetcher } from '../lib/client';
import type HelloController from './HelloController';
import metadata from '../vovk-metadata.json' assert { type: 'json' };

type HelloControllerType = typeof HelloController;

const controller = clientizeController<HelloControllerType>(metadata.HelloController, {
    fetcher: myCustomFetcher,
});
```

The fetcher implements type `VovkClientFetcher<ApiOptions>` imported from **vovk/client** where `ApiOptions` generic indicates custom options that you may find useful to implement at the client-side library.

```ts
// lib/client
type ApiOptions = {
    successMesage: string;
};

const myCustomFetcher: VovkClientFetcher<ApiOptions> = (
  { httpMethod, getPath, validate },
  { params, query, body, ...options }
) => {
  const { successMessage } = options;
  const endpoint = getPath(params, query);

  try {
    validate({ body, query });
  } catch {
    alert('Validation eror');
  }

  try {
    const resp = await fetch(endpoint, {
      method: httpMethod,
      body: JSON.stringify(body)
    });

    const json = await resp.json();

    alert(successMessage);

    return json;
  } catch {
    alert('Unable to fetch or parse the response')
  }
};

```

```ts
// vovk/hello/HelloState.ts
import { myCustomFetcher } from '../lib/client';
// ... rest imports

const controller = clientizeController<HelloControllerType>(metadata.HelloController, {
    fetcher: myCustomFetcher,
});
```

You can also export your own clientize function to avoid repeating yourself.

```ts
// lib/client

type ApiOptions = // ...

const myCustomFetcher = // ...

export const clientize = <T>(controllerMetadata: Parameters<typeof clientizeController>[0]) => {
  return clientizeController<T, ApiOptions>(controllerMetadata, {
    fetcher: clientFetcher,
  });
};
```

Then import it to your state file:

```ts
// vovk/hello/HelloState.ts
import { clientize } from '../lib/client';
import type HelloController from './HelloController';

type HelloControllerType = typeof HelloController;

const controller = clientize<HelloControllerType>(metadata.HelloController);

// ...
```

## Automatically generated endpoints

If the API (or part of it) of the Vovk app isn't going to be exposed for remote use, you can avoid endpoint definition completely. All HTTP decorators have `.auto()` method that generates endpoint name automatically from controller name and static method name.

```ts
// vovk/hello/HelloController.ts - the back-end
import { get, type VovkRequest } from 'vovk';

export class HelloController {
    static controllerName = 'HelloController';

    @get.auto()
    static postSomeData(req: VovkRequest) {
        // ...
    }
}
```

The above example is going to create GET endpoint with path *hello-controller/post-some-data*. If `@prefix` is used, the endpoint path is going to be concatenated with it.

```ts
// vovk/hello/HelloController.ts - the back-end
import { get, prefix, type VovkRequest } from 'vovk';

@prefix('foo')
export class HelloController {
    static controllerName = 'HelloController';

    @get.auto()
    static postSomeData(req: VovkRequest) {
        // ...
    }
}
```

The example above creates GET endpoint with path *foo/hello-controller/post-some-data*. Endpoint obfuscation is prioritised at the project roadmap.

## Error handling

Errors thrown by controller are re-thrown at client-side. The error object implements `ErrorResponseBody` type that looks like that:

```ts
// internal Vovk type
export type ErrorResponseBody = {
  statusCode: HttpStatus;
  message: string;
  isError: true;
}
```

```ts
// vovk/hello/HelloController.ts
import { get, type VovkRequest } from 'vovk';

export class HelloController {
    static controllerName = 'HelloController';

    @get(':someParam')
    static doSomething(req: VovkRequest) {
        // ...
        throw new Error('Some error');
        // ...
    }
}
```

There is how you handle the errors on the client-side:

```ts
// vovk/hello/HelloState.ts
import type { ErrorResponseBody } from 'vovk';

// ...
export const helloState = {
    doSomething: () => {
        try {
            await controller.doSomething({ body, query, params });
        } catch (e) {
            const err = e as ErrorResponseBody;

            console.log(err); // { message: 'Some error', statusCode: 500, isError: true }
        }
    }
};
```

Regular errors are treated as 500 errors. To throw specific error codes at the controller you can throw an instance of `HttpException` that receives `HttpStatus` enum value as the first argument and error message as the second.

```ts
// vovk/hello/HelloController.ts
import { get, HttpStatus, HttpException } from 'vovk';

export class HelloController {
    static controllerName = 'HelloController';

    @get(':someParam')
    static doSomething() {
        // ...
        throw new HttpException(HttpStatus.BAD_REQUEST, 'Some error');
        // ...
    }
}
```

```ts
// vovk/hello/HelloState.ts
// ...
try {
    await controller.doSomething({ body, query, params });
} catch (e) {
    const err = e as ErrorResponseBody;

    console.log(err); // { message: 'Some error', statusCode: 400, isError: true }
}
// ...
```

## Type extraction

Vovk.ts provides some useful types that allow you to extract type from the controller methods. 

Let's say you have the following controller:

```ts
// vovk/hello/HelloController.ts - the back-end
import { get, type VovkRequest } from 'vovk';

export class HelloController {
    static controllerName = 'HelloController';

    @get(':someParam')
    static doSomething(req: VovkRequest<{ body: true }, { query: string }>, { someParam }: { someParam: string }) {
        // ...
        return { success: true };
    }
}
```

You can extract types of `doSomething` defined with `VovkRequest` the wollowing way:

```ts
// vovk/hello/HelloState.ts
import type { VovkBody, VovkQuery, VovkParams, VovkReturnType } from 'vovk';
import type HelloController from './HelloController';

type HelloControllerType = typeof HelloController;

// { body: true }
type DoSomethingBody = VovkBody<HelloControllerType['doSomething']>;
// { query: string }
type DoSomethingQuery = VovkQuery<HelloControllerType['doSomething']>;
// { someParam: string }
type DoSomethingParams = VovkParams<HelloControllerType['doSomething']>;
// { success: boolean }
type DoSomethingReturnType = VovkReturnType<HelloControllerType['doSomething']>;
```

And you can use these types to define client-side methods that invoke clientized controller methods. 

```ts
// vovk/hello/HelloState.ts
import type { VovkBody, VovkQuery, VovkParams, VovkReturnType } from 'vovk';
import type HelloController from './HelloController';

// const controller = clientizeController ...

export const helloState = {
    doSomething: (
        body: VovkBody<HelloControllerType['doSomething']>, 
        query: VovkQuery<HelloControllerType['doSomething']>, 
        params: VovkParams<HelloControllerType['doSomething']>
    ): Promise<VovkReturnType<HelloControllerType['doSomething']>> => {
        return controller.doSomething({ body, query, params });
    }
};
```


