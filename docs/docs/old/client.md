---
sidebar_position: 2
---

# Client

**vovk/client** module exports utilities that turn controllers in a well-typed TypeScript library. It recognises types imported with `import type` from controllers and generates a fetching library that implements the same methods that are implemented by controllers.


```ts
// /src/vovk/hello/HelloController.ts
import { post, type VovkRequest } from 'vovk';

export class HelloController {
    static controllerName = 'HelloController';

    @post('hello/:someParam')
    static postSomeData(
        req: VovkRequest<{ hello: number }, { foo: string }>, 
        { someParam }: { someParam: string }
    ) {
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

`clientizeController` accepts controller type and controller metadata as an input and returns the fetching library. The library recognises types of body, query, params and the return type so you don't need to repeat types or store them in another file.

```ts
// /src/vovk/hello/HelloState.ts
import { clientizeController } from 'vovk/client';
import type HelloController from './HelloController';
import metadata from '../vovk-metadata.json' assert { type: 'json' };

const controller = clientizeController<typeof HelloController>(metadata.HelloController);

export async function postSomeData(hello: string, foo: string) {
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
```

`VovkRequest` also supports branded and flavoured types.

```ts
// /src/vovk/hello/HelloController.ts
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

## Overriding the default fetch function

Almost every complex React project requires its own fetching implementation to interact with application state, show success and error messages, log errors to a third-party service such as Sentry. `clientizeController` provides a set of options, and one of them is `fetcher` that overrides the default fetcher that's provided out of the box.

```ts
// /src/vovk/hello/HelloState.ts
import { myCustomFetcher } from '../lib/myClient';
import type HelloController from './HelloController';
import metadata from '../vovk-metadata.json' assert { type: 'json' };

const controller = clientizeController<typeof HelloController>(metadata.HelloController, {
    fetcher: myCustomFetcher,
});
```

The fetcher implements type `VovkClientFetcher<API_OPTIONS>` imported from **vovk/client** where `API_OPTIONS` generic parameter indicates custom options that you may find useful to implement at your own client-side fetching library.

```ts
// /src/lib/myClient
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
// /src/vovk/hello/HelloState.ts
import { myCustomFetcher } from '../lib/myClient';
// ... rest imports

const controller = clientizeController<HelloControllerType>(metadata.HelloController, {
    fetcher: myCustomFetcher,
});
```

You can also export your own clientize function to avoid repeating yourself.

```ts
// /src/lib/myClient

type ApiOptions = // ...

const myCustomFetcher = // ...

export const clientize = <T>(controllerMetadata: Parameters<typeof clientizeController>[0]) => {
  return clientizeController<T, ApiOptions>(controllerMetadata, {
    fetcher: myCustomFetcher,
  });
};
```

Then import it to your state file:

```ts
// /src/vovk/hello/HelloState.ts
import { clientize } from '../lib/myClient';
import type HelloController from './HelloController';

const controller = clientize<typeof HelloController>(metadata.HelloController);

// ...
await controller.postSomeData({
    // ...
    successMessage: 'Successfully posted some data',
})
```

## Default options

`clientizeController` accepts `defaultOptions` option to support default values for your custom message. Extending the example above you can define `defaultOptions.successMessage` for all API calls by default.

```ts
// /src/vovk/hello/HelloState.ts
const controller = clientize<typeof HelloController>(metadata.HelloController, {
    defaultOptions: {
        successMessage: 'Success!',
    }
});
```

In case if you use the defaul fetcher, the options would be 

- `prefix` that defines relative path to the API route (default `/api`).
- `isStream` to enable streaming for this specific instance by default.

```ts
const controller = clientizeController<HelloControllerType>(metadata.HelloController, {
    defaultOptions: {
        prefix: '/my-custom-api-prefix'
    }
});
```

## Automatically generated endpoints

If the API (or part of it) of Vovk app isn't going to be exposed for remote use, you can avoid endpoint definition completely. All HTTP decorators have `.auto()` method that generates endpoint name automatically from controller name and static method name.

```ts
// /src/vovk/hello/HelloController.ts - the back-end
import { get, type VovkRequest } from 'vovk';

export class HelloController {
    static controllerName = 'HelloController';

    @get.auto()
    static postSomeData(req: VovkRequest) {
        // ...
    }
}
```

The above example is going to create GET endpoint with path **hello-controller/post-some-data**. If `@prefix` is used, the endpoint path is going to be concatenated with it.

```ts
// /src/vovk/hello/HelloController.ts - the back-end
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

The example above creates GET endpoint with path **foo/hello-controller/post-some-data**. Endpoint obfuscation is prioritised at the project roadmap.

## Error handling

Errors thrown by controller are re-thrown at client-side. The error object implements `VovkErrorResponse` type that looks like that:

```ts
// internal Vovk type
export type VovkErrorResponse = {
  statusCode: HttpStatus;
  message: string;
  isError: true;
}
```

```ts
// /src/vovk/hello/HelloController.ts
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
// /src/vovk/hello/HelloState.ts
import type { VovkErrorResponse } from 'vovk';

// ...
export const helloState = {
    doSomething: () => {
        try {
            await controller.doSomething({ body, query, params });
        } catch (e) {
            const err = e as HttpException;

            console.log(err); // HttpException<{ message: 'Some error', statusCode: 500 }>
        }
    }
};
```

Regular errors are treated as 500 errors. To throw specific error codes at the controller you can throw an instance of `HttpException` that receives `HttpStatus` enum value as the first argument and error message as the second.

```ts
// /src/vovk/hello/HelloController.ts
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
// /src/vovk/hello/HelloState.ts
// ...
try {
    await controller.doSomething({ body, query, params });
} catch (e) {
    const err = e as HttpException;

    console.log(err); // HttpException<{ message: 'Some error', statusCode: 400 }>
}
// ...
```

## Type extraction

Vovk.ts provides some useful types that allow you to extract type from the controller methods. 

Let's say you have the following controller:

```ts
// /src/vovk/hello/HelloController.ts - the back-end
import { get, type VovkRequest } from 'vovk';

export class HelloController {
    static controllerName = 'HelloController';

    @get(':someParam')
    static doSomething(
        req: VovkRequest<{ body: true }, { query: string }>, 
        { someParam }: { someParam: string }
    ) {
        // ...
        return { success: true };
    }
}
```

You can extract types of `doSomething` defined with `VovkRequest` the wollowing way:

```ts
// /src/vovk/hello/HelloState.ts
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
// /src/vovk/hello/HelloState.ts
import type { VovkBody, VovkQuery, VovkParams, VovkReturnType } from 'vovk';
import type HelloController from './HelloController';

// const controller = clientizeController ...
export function doSomething: (
    body: VovkBody<HelloControllerType['doSomething']>, 
    query: VovkQuery<HelloControllerType['doSomething']>, 
    params: VovkParams<HelloControllerType['doSomething']>
): Promise<VovkReturnType<HelloControllerType['doSomething']>> {
    return controller.doSomething({ body, query, params });
}
```


