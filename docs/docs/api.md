---
sidebar_position: 5
---

# API

Full list of available exports for quick reference: 

```ts
export {
  // core
  initVovk,
  createDecorator,
  // controller method decorators
  get, 
  post, 
  put, 
  patch, 
  del, 
  head, 
  options, 
  // controller class decorator
  prefix, 
  // worker service class decorator 
  worker,
  // common types
  type VovkConfig,
  type VovkEnv,
  type VovkMetadata,
  type VovkErrorResponse,
  // types used by controllers
  type VovkRequest,
  type VovkBody,
  type VovkQuery,
  type VovkParams,
  type VovkReturnType,
  type VovkYieldType,
  // types used by client
  type VovkClientBody,
  type VovkClientQuery,
  type VovkClientParams,
  type VovkClientReturnType,
  type VovkClientYieldType,
  type VovkClientOptions,
  // classes
  StreamResponse,
  HttpException,
  // enums
  HttpStatus,
  HttpMethod,
};
```

## Core

### `initVovk`

Generates standard Next.js App Route handlers. Accepts the following options:

- `controllers: Record<string, Function>` - the list of Controllers
- `workers?: Record<string, Function>` - the list of Worker Services
- `exposeValidation?: boolean` - set to `false` if you want to hide validation logic from the client-side code.
- `onError?: (err: Error) => void | Promise<void>` - called on Controller exceptions, can be used to log errors by a third-party service

```ts
// /src/app/api/[[...vovk]]/route.ts
import { initVovk } from 'vovk';
import HelloController from '../../../modules/hello/HelloController';
import UserController from '../../../modules/user/UserController';
import HelloWorker from '../../../modules/hello/HelloWorker';
import UserWorker from '../../../modules/user/UserWorker';

const controllers = { HelloController, UserController };
const workers = { HelloWorker, UserWorker };

export type Controllers = typeof controllers;
export type Workers = typeof workers;

export const { GET, POST, PUT, DELETE } = initVovk({
  controllers,
  workers,
  exposeValidation: false,
  onError(e) {
    console.log('Error', e);
  }
});
```

### `createDecorator`

Defines a custom decorator to extend default behavoir of endpoints. Accepts 2 arguments: middleware function and init function. The first one defines what the decorator is going to do, the second one is called once per initialisation and intended to pass extra data to the metadata file (for now it's client validation, if exposed).

The middleware accepts at least 2 arguments: `VovkRequest`, `next` function that needs to be called and its awaited result needs to be returned after you perform required actions and `...rest` - the arguments that are going to be used by the created decorator fabric.

```ts
import { createDecorator, get, HttpException, HttpStatus } from 'vovk';

const myDecorator = createDecorator((req, next, a: string, b: number) => {
  console.log(a, b); // Outputs: "foo", 1

  if(isSomething) { 
    // override route method behavior and return { hello: 'world' } from the endpoint
    return { hello: 'world' };
  }

  if(isSomethingElse) {
    // throw HTTP error if needed
    throw new HttpException(HttpStatus.BAD_REQUEST, 'Something went wrong');
  }

  return next();
}, (a: string, b: number) => {
    console.info('Decorator is initialised with', a, b);
});

class MyController {
  static controllerName = 'MyController';

  @get.auto()
  @myDecorator('foo', 1) // Passes 'foo' as 'a', and 1 as 'b'
  static getSomething() {
    // ...
  }
}
```

## Controller Decorators

### `@prefix` decorator

`@prefix(p: string)` decorator used to prepend a sub-path to the endpoint.

### `@get`, `@post`, `@put`, `@patch`, `@del`, `@head`, `@options`

`@HTTP_METHOD(p: string, opts?: { cors?: boolean, headers?: Record<string, string> })` decorator define an HTTP method and an endpoint that's handled by the Controller method.

### `@get.auto`, `@post.auto`, `@put.auto`...

`@HTTP_METHOD.auto(opts?: { cors?: boolean, headers?: Record<string, string> })` define HTTP method and generate endpoint string automatically from controller and method name.

```ts
import { prefix, get, post, put, patch, del, head, options } from 'vovk';

@prefix('hello')
export default class HelloController {
    @get('world', { cors: true })
    static getHelloWorld() {
        return { hello: 'world' };
    }

    @post.auto({ headers: { 'x-hello': 'world' }})
    static postData(/* req: VovkRequest */) {
        return { success: true };
    }
}
```

## `worker` decorator

To defines required `onmessage` handler for a worker service.

```ts
// /src/modules/hello/HelloWorkerService.ts
import { worker } from 'vovk';

@worker()
export default class HelloWorkerService {
    static heavyCalculation() {
        // ...
    }
}
```

### Enums

```ts
import { HttpMethod, HttpStatus, HttpException } from 'vovk';
```

#### `HttpMethod` enum

The enum has no specific purpose. It is used internally and can be used with your code to create a custom fetcher.

```ts
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
}
```

#### `HttpStatus` enum

Used to throw and catch errors thrown by the server. Notice `NULL` member. It can be used to simulate HTTP errors on client validation errors (this approach is used at [vovk-zod](https://github.com/finom/vovk-zod)).

```ts
export enum HttpStatus {
  NULL = 0,
  CONTINUE = 100,
  SWITCHING_PROTOCOLS = 101,
  PROCESSING = 102,
  EARLYHINTS = 103,
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NON_AUTHORITATIVE_INFORMATION = 203,
  NO_CONTENT = 204,
  RESET_CONTENT = 205,
  PARTIAL_CONTENT = 206,
  AMBIGUOUS = 300,
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  SEE_OTHER = 303,
  NOT_MODIFIED = 304,
  TEMPORARY_REDIRECT = 307,
  PERMANENT_REDIRECT = 308,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  PAYMENT_REQUIRED = 402,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  NOT_ACCEPTABLE = 406,
  PROXY_AUTHENTICATION_REQUIRED = 407,
  REQUEST_TIMEOUT = 408,
  CONFLICT = 409,
  GONE = 410,
  LENGTH_REQUIRED = 411,
  PRECONDITION_FAILED = 412,
  PAYLOAD_TOO_LARGE = 413,
  URI_TOO_LONG = 414,
  UNSUPPORTED_MEDIA_TYPE = 415,
  REQUESTED_RANGE_NOT_SATISFIABLE = 416,
  EXPECTATION_FAILED = 417,
  I_AM_A_TEAPOT = 418,
  MISDIRECTED = 421,
  UNPROCESSABLE_ENTITY = 422,
  FAILED_DEPENDENCY = 424,
  PRECONDITION_REQUIRED = 428,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
  HTTP_VERSION_NOT_SUPPORTED = 505,
}
```

## Classes

### `HttpException` class

Used to throw HTTP errors on server-side and re-throw, simulate or handle HTTP errors on client-side. The instance provides 2 properties: `statusCode` and `message`.

Server-side:

```ts
// /src/modules/hello/HelloController.tsx
// ...
export default class HelloController {
    @get()
    static getHello() {
        if(/* ... */) {
            throw new HttpException(HttpStatus.BAD_REQUEST, 'Something went wrong'); 
        }
    }
}
```

Client-side:

```ts
// /src/modules/hello/HelloState.ts
import { HelloController } from '@vovkts/client';

export async function getHello() {
    try {
        return await HelloController.getHello();
    } catch (e) {
        console.log(e instanceof HttpException);
        const err = e as HttpException;
        console.log(err.statusCode, err.message);
    }
}
```

### StreamResponse

`StreamResponse<T>(init?: ResponseInit)` class can be used as an alternative to generators to implement response streaming. Instances of this class provide the following methods:

- `send(data: T)` - sends portion of data
- `close()` - close the connection
- `throw(error: any)` - throws an error on client-side and closes the connection


```ts
import { prefix, get, StreamResponse, type VovkRequest } from 'vovk';

type Token = { message: string };

@prefix('stream')
export default class StreamController {
  @get('tokens')
  static async streamTokens() {
    const resp = new StreamResponse<Token>();

    void (async () => {
      const tokens: Token[] = [
        { message: 'Hello,' },
        { message: ' World' },
        { message: '!' },
      ];

      for (const token of tokens) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        if(somethingWentWrong) {
          resp.throw(new Error('Somethiing went wrong'));
        }
        resp.send(token);
      }

      resp.close();
    });

    return resp;
  }
}
```


The class also provides static property `defaultHeaders` that contains the standard headers for keep-alive connections. Since `StreamResponse` accepts standard `ResponseInit` as options argument you can override default headers by optionally using `defaultHeaders`.

```ts
const resp = new StreamResponse<Token>({
  headers: {
    ...StreamResponse.defaultHeaders,
    'x-hello': 'world',
  }
});
```

## Common types

### `VovkConfig` type

Defines config types.

```ts
// /vovk.config.js
/** @type {import('vovk').VovkConfig} */
const vovkConfig = {
  // ...
}

module.exports = vovkConfig;
```

For more info check [customization docs](./customization).

### `VovkEnv` type

Defines Vovk.ts env variable types.

For more info check [customization docs](./customization).

### `VovkMetadata` type

Defines format for **.vovk.json**

### `VovkErrorResponse` type

(Advanced) Original shape of an object returned from the server when an error is thrown.

## Controller Types

### `VovkRequest` type

The type is used to define types for `req.json` and `req.nextUrl.searchParams.get` and allow to infer types in other environments.

```ts
// /src/modules/hello/HelloController.ts 
import { get, type VovkRequest } from 'vovk';

export class HelloController {
    @get(':someParam')
    static doSomething(
        req: VovkRequest<{ body: true }, { q: string }>, 
        { someParam }: { someParam: string }
    ) {
        const body = await req.body(); // { body: true }
        const q = req.nextUrl.searchParams.get('q'); // string
        const nope = req.nextUrl.searchParams.get('nope'); // never
        // ...
        return { success: true };
    }
}
```

### `VovkBody` type

Extracts request body type from a controller method.

### `VovkQuery` type

Extracts query (search params) type from a controller method.

### `VovkParams` type

Extracts params type from a controller method.

### `VovkReturnType` type

Extracts return type from a controller method and unwraps promise.

### `VovkYieldtype` type

Extracts yield type from a generator controller method.

```ts
// /src/modules/hello/HelloState.ts
import {
  get,
  type VovkBody, 
  type VovkQuery, 
  type VovkParams, 
  type VovkReturnType, 
  type VovkYieldtype 
} from 'vovk';

export class HelloController {
    @get(':someParam')
    static doSomething(/* ... */) {
        // ...
    }

    static *generator(/* ... */)
}

type DoSomethingBody = VovkBody<typeof HelloController.doSomething>;
type DoSomethingQuery = VovkQuery<typeof HelloController.doSomething>;
type DoSomethingParams = VovkParams<typeof HelloController.doSomething>;
type DoSomethingReturnType = VovkReturnType<typeof HelloController.doSomething>;
type GeneratorYieldtype = VovkYieldType<typeof HelloController.generator>;
```


## Types for the Client

### `VovkClientBody` type

Extracts request body type from a clientized controller method.

### `VovkClientQuery` type

Extracts query (search params) type from a clientized controller method.

### `VovkClientParams` type

Extracts params type from a clientized controller method.

### `VovkClientReturnType` type

Extracts return type from a clientized controller method and unwraps promise.

### `VovkClientYieldType` type

Extracts yield type from a clientized generator controller method.


```ts
import { HelloController } from '@vovkts/client';

type DoSomethingBody = VovkClientBody<typeof HelloController.doSomething>;
type DoSomethingQuery = VovkClientQuery<typeof HelloController.doSomething>;
type DoSomethingParams = VovkClientParams<typeof HelloController.doSomething>;
type DoSomethingReturnType = VovkClientReturnType<typeof HelloController.doSomething>;
type GeneratorYieldtype = VovkClientYieldType<typeof HelloController.generator>;
```

### `VovkClientOptions` type

(Advanced) Type that used internally and exposed to customize the client. Please see [decorators documentation](./decorators) and [customization page](./customization).