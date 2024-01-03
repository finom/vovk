---
sidebar_position: 7
---

# API Reference

Full list of available exports: 

```ts
import {
  // core
  initVovk,
  createDecorator,
  // decorators
  get, 
  post, 
  put, 
  patch, 
  del, 
  head, 
  options, 
  prefix, 
  // class
  HttpException,
  // enums
  HttpStatus,
  HttpMethod,
  // types
  type VovkRequest,
  type VovkBody,
  type VovkQuery,
  type VovkParams,
  type VovkReturnType,
} from 'vovk';

import { 
  // function
  clientizeController, 
  // types
  type VovkClientFetcher, 
  type VovkClientOptions 
} from 'vovk/client';

import { 
  // decorator
  worker, 
  // function
  promisifyWorker 
} from 'vovk/worker';
```

## "vovk" module

The **"vovk"** module exports initialisation function, server-side API and server-side types that can be used by other environments to retrieve request body types to client-side, `HttpException` to throw server-side errors or simulate HTTP errors on client-side.

### Core

#### `initVovk`

Generates standard Nest.js App Route handlers. Accepts the following options:

- `controllers: Function[]` - the list of Controllers
- `workers?: Function[]` - the list of Worker Services
- `exposeValidation?: boolean` - set to `false` if you want to hide validation logic from the client-side code.
- `onError?: (err: Error) => void | Promise<void>` - called on Controller exceptions, can be used to log errors by a third-party service
- `onMetadata?: (metadata: Metadata, write: WriteFunction) => void | Promise<void>;` - invoked on every API request to create **/src/vovk/vovk-metadata.json**. Accepts 2 arguments: metadata object and `write` function that writes metadata to the file if data is changed. The `write` function by itself accepts 3 arguments: metadata path, metadata object and Node.js libraries passed to avoid compilation errors in Next.js runtime.

```ts
// /src/app/api/[[...]]/route.ts
import { initVovk } from 'vovk';
import HelloController from '../../../vovk/hello/HelloController';
import UserController from '../../../vovk/user/UserController';
import HelloWorker from '../../../vovk/hello/HelloWorker';
import UserWorker from '../../../vovk/user/UserWorker';

export const { GET, POST, PUT, DELETE } = initVovk({
  controllers: [HelloController, UserController],
  workers: [HelloWorker, UserWorker],
  exposeValidation: false,
  onError(e) {
    console.log('Error', e);
  }
  async onMetadata(metadata, write) {
    if (process.env.NODE_ENV === 'development') {
      const [fs, path] = await Promise.all([import('fs/promises'), import('path')]);
      const metadataPath = path.join(/* ... */);

      await write(metadataPath, metadata, { fs, path });
    }
  },
});
```

#### `createDecorator`

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

### Controller Decorators

#### `@prefix` decorator

`@prefix(p: string)` decorator used to prepend a sub-path to the endpoint.

#### `@get`, `@post`, `@put`, `@patch`, `@del`, `@head`, `@options`

`@HTTP_METHOD(p: string)` decorator define an HTTP method and an endpoint that's handled by the Controller method.

#### `@get.auto`, `@post.auto`, `@put.auto`...

`@HTTP_METHOD.auto()` define HTTP method and generate endpoint string automatically from controller and method name.

```ts
import { prefix, get, post, put, patch, del, head, options } from 'vovk';

@prefix('hello')
export default class HelloController {
    static controllerName = 'HelloController';

    @get('world')
    static getHelloWorld() {
        return { hello: 'world' };
    }

    @post.auto()
    static postData(/* req: VovkRequest */) {
        return { success: true };
    }
}
```

### Enums and classes

```ts
import { HttpMethod, HttpStatus, HttpException } from 'vovk';
```

#### `HttpMethod` enum

The enum has no specific purpose. It is used internally and can be used with your code to create custom fetcher.

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

### `HttpException` class

Used to throw HTTP errors on server-side and re-throw, simulate or handle HTTP errors on client-side. The instance provides 2 properties: `statusCode` and `message`.

Server-side:

```ts
// /src/vovk/hello/HelloController.tsx
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
// /src/vovk/hello/HelloState.ts
import { clientizeController } from 'vovk/client';
import type HelloController from './HelloController';
import metadata from '../vovk-metadata.json' assert { type: 'json' };

const controller = clientizeController<typeof HelloController>(metadata.HelloController);

export async function getHello() {
    try {
        return await controller.getHello();
    } catch (e) {
        console.log(e instanceof HttpException);
        const err = e as HttpException;
        console.log(err.statusCode, err.message);
    }
}
```

### Types

#### `VovkRequest` type

The type is used to define types for `req.json` and `req.nextUrl.searchParams.get` and allow to infer types in other environments.

```ts
// /src/vovk/hello/HelloController.ts 
import { get, type VovkRequest } from 'vovk';

export class HelloController {
    static controllerName = 'HelloController';

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


#### `VovkBody` type

Extracts request body type fom the controller method.

#### `VovkQuery` type

Extracts query (search params) type fom the controller method.

#### `VovkParams` type

Extracts params type fom the controller method.

#### `VovkReturnType` type

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


## "vovk/client" module

### `clientizeController` function

Turns Controller types and metadata into client-side fetching library. Types of body, query and params are inferred from the controller method signature.

`clientizeController<T, OPTS>(controllerMetadata: object, options?: VovkClientOptions<OPTS>)` accepts controller type as first generic parameter, optional custom fetcher options as second generic parameter, metadata object as the first argument and optional clientize settings object as the second argument.

Please check [Client Documentation](./client) for more info.

### `VovkClientOptions` type

`VovkClientOptions<OPTS>` type includes the following members:

- `disableClientValidation?: boolean` disables client-side validation for debugging purposes.
- `fetcher?: _VovkClientFetcher<OPTS>` overrides default fetcher.
- `streamFetcher?: _VovkClientFetcher<OPTS>` overrides default stream fetcher.
- `validateOnClient?: (input: { body?: unknown; query?: unknown }, validators: { body?: unknown; query?: unknown }) => unknown;` defines client-side validation function.
- `defaultOptions?: Partial<OPTS>` allows to set default options for the client-side fetching library.


```ts
const controller = clientizeController<typeof HelloController, CustomApiOptions>(metadata.HelloController, {
  disableClientValidation: true,
  fetcher: myCustomFetcher
  streamFetcher: myCustomStreamFetcher
  validateOnClient: zodValidateOnClient
  defaultOptions: {
    successMessage: 'Success!'
  }
} satisfies VovkClientOptions<CustomApiOptions>);
```

### `VovkClientFetcher` type

Custom fetchers need to satisfy `VovkClientFetcher<OPTS>` type. The `OPTS` parameter defines what extra options are going to be used by clientized controller methods or by `defaultOptions` described above.

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

  // ...
};

```

```ts
// /src/vovk/hello/HelloState.ts
import { myCustomFetcher } from '../lib/myClient';
// ... rest imports

const controller = clientizeController<HelloControllerType>(metadata.HelloController, {
    fetcher: myCustomFetcher,
});

// ...
await controller.doSomething({ successMessage: 'Success!' });
```


## "vovk/worker" module

The module provides API to define and handle Worker Services.

### `@worker` decorator

`@worker()` adds required `onmessage` event listener in Worker thread and does nothing in ther environments. The listener establishes communication channel to other threads used by the client-side code.

```ts
// /src/vovk/hello/HelloWorkerService.ts
import { worker } from 'vovk/worker';

@worker()
export default class HelloWorkerService {
    static workerName = 'HelloWorkerService';

    static heavyCalculation(iterations: number) {
        let result: number;
        // ... heavy calculations

        return result;
    }
}
```

### `promisifyWorker` function

`promisifyWorker<T>(worker: Worker, workerMetadata: object)` creates promisified library using Worker Service type as generic parameter, Web Worker as the first argument and metadata as the second argument.

For more info check [Worker Documentation](./worker).

```ts
// /src/vovk/hello/HelloState.ts
import type HelloWorkerService from './HelloWorkerService';
import metadata from '../vovk-metadata.json' assert { type: 'json' };

// ...
const worker = promisifyWorker<typeof HelloWorkerService>(
    new Worker(new URL('./HelloWorkerService.ts', import.meta.url)),
    metadata.workers.HelloWorkerService
);

// result is casted as number
const result = await worker.heavyCalculation(100_000_000);
// ...
```