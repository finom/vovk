---
sidebar_position: 1
---

# Controller

## Controller definition

Controller is a static class that handles incoming HTTP requests. The methods of this class that are decorated with HTTP decorator accept 2 arguments: `NextRequest` that is not modified in any way by Vovk.ts and parameters that are defined by decorator path. 

```ts
import type { NextRequest } from 'next';
import { prefix, put } from 'vovk';

@prefix('users')
export default class UserController {
    // Example request: PUT /api/users/69?role=moderator
    @put(':id') 
    static async updateUser(req: NextRequest, { id }: { id: string }) {
        const data = await req.json();
        const userRole = req.nextUrl.searchParams.get('role');
        // ...
        return updatedUser;
    }
}
```

At the example aboce `data` is casted as `any` and `userRole` is casted as `string | null`. To fix the types Vovk.ts provides a new type `VovkRequest<BODY?, QUERY?>` that is extended from `NextRequest` where the first generic argument represents the type of value returned from `req.json` but also allows to define values returned from `req.nextUrl.searchParams.get`. `VovkRequest` also plays an important role in type inference in generting client library, exported from **vovk-client**. 

As its mentioned before, `req` object is an original `NextRequest` object that provided by Next.js as is without changing it, but third-party libraries (like **vovk-zod**) as well as your custom code can modify this object when required (for example to add `currentUser` property defined by your auth guard).

To add the required types just replace `NextRequest` by `VovkRequest`. Let's modify the abstract example above.

```ts
// /src/modules/user/UserController.ts
import { prefix, put, type VovkRequest } from 'vovk';
import type { User } from '../../types';

@prefix('users')
export default class UserController {
    // Example request: PUT /api/users/69?role=moderator
    @put(':id') 
    static async updateUser(
        req: VovkRequest<Partial<User>, 'user' | 'moderator' | 'admin'>, 
        { id }: { id: string }
    ) {
        const data = await req.json();
        const userRole = req.nextUrl.searchParams.get('role');
        // ...
        return updatedUser;
    }
}
```

As you can see we've changed nothing more than the type of `req` but now `data` receives type of `Partial<User>` and `userRole` is casted as `'user' | 'moderator' | 'admin'` and does not extend `null` anymore.

## Client library

Once controller is defined it needs to be initialized at the wildcard route explained in the [Inroduction](./intro).

```ts
// /src/app/api/[[...vovk]]/route.ts
import { initVovk } from 'vovk';
import UserController from '../../../modules/user/UserController';

const controllers = { UserController };
const workers = {}; // See Worker documentation

export type Controllers = typeof controllers;
export type Workers = typeof workers;

export const { GET, POST, PUT, DELETE } = initVovk({ controllers, workers });
```

`initVovk` performs required actions to generate client-side library and no additional action from your side is required (but you probably would need to restart TS Server to update types if you use VSCode).

The client library implements the same methods (in our case `updateUser`) but changes the method interface so you can pass required input data as options (`body`, `query` and `params`). **vovk-client** can be used in client components, server components, application state and even be distributed as a standalone package. For an illustration [vovk-examples](https://github.com/finom/vovk-examples) is published as a [standalone NPM package](https://www.npmjs.com/package/vovk-examples) to be used on [vovk.dev](https://vovk.dev) that by itself is a static website powered by gh-pages.

Note that everything exported from **vovk-client** is plain old JavaScript with TS typings that calls regular `fetch` function. Vovk.ts does not use `Proxy` object that author of this library considers as cheating.

```ts
import { UserController } from 'vovk-client';

// ...

const updatedUser = await UserController.updateUser({
    body: { firstName, lastName },
    query: { role: 'admin' },
    params: { id: '69' },
});
```

It's worthy to mention that client library can be !!!!!customised in order to follow custom logic required by the application.

```ts
 await UserController.updateUser({
    // ...
    successMessage: 'Successfully created the user',
    someOtherCustomFlag: true,
});
```

## Return type

### Custom object

The decorated static methods of controllers can return several kinds of objects. The most common is a custom object. Let's say your controller method returns Prisma ORM invocation.

```ts
// ...
static async updateUser(/* ... */) {
    // ...
    const updatedUser = await prisma.user.update({
        where: { id },
        data,
    });

    return updatedUser;
}
// ...
```

At this case the returned value of client method `UserController.updateUser` is going to be casted as `User` generated at **@prisma/client**.

### Response object

HTTP handlers can also return regular `Response` object, for example `NextResponse`. 

```ts
// ...
static async updateUser(/* ... */) {
    // ...
    return NextResponse.json(updatedUser, { status: 200 });
}
// ...
```

At this case client library wouldn't be able to properly recognise type of returned value but you can override the type manually by using generic argument that completely overrides the return type without need to cast it to `unknown`.

```ts
import { UserController } from 'vovk-client';
import { User } from '../../types';

// ...

const updatedUser = await UserController.updateUser<User>(/* ... */);
```

### Async iterable

```ts
// ...
static async *updateUser(/* ... */) {
    // ...
    yield* iterable;
}
// ...
```

If iterable is returned, the client library is going to cast the method also as async iterable to implement response streaming. It's explained in more details below but worthy to mention here.

## Auto-generated endpoints

All HTTP decorators provide `.auto` static method that generates endpoint name automatically from the method name.

```ts
// /src/modules/user/UserController.ts
import { prefix, put } from 'vovk';

@prefix('users')
export default class UserController {
    // Example request: PUT /api/users/do-something
    @put.auto() 
    static async doSomething(/* ... */) {
        // ...
    }
}
```

## Response headers

All HTTP decorators support custom response headers provided as the second argument.

```ts
// ...
export default class UserController {
    @put('do-something', { headers: { 'x-hello': 'world' } }) 
    static async doSomething(/* ... */) { /* ... */ }
}
```

To enable CORS instead of manually setting up headers you can use `cors: true` option.

```ts
// ...
export default class UserController {
    @put('do-something', { cors: true }) 
    static async doSomething(/* ... */) { /* ... */ }
}
```

For auto-generated endpoints `cors` and `headers` are defined as the only argument.


```ts
// ...
export default class UserController {
    @put.auto({ cors: true, headers: { 'x-hello': 'world' } }) 
    static async doSomething(/* ... */) { /* ... */ }
}
```

## Errors: `HttpException` class and `HttpStatus` enum

You can gracefully throw HTTP exceptions similarly to NestJS approach. `HttpException` accepts 2 arguments. The first one is an HTTP code that can be retrieved from `HttpStatus`, the other one is error text.

```ts
import { HttpException, HttpStatus } from 'vovk';

// ...
static async updateUser(/* ... */) {
    // ...
    throw new HttpException(HttpStatus.BAD_REQUEST, 'Something went wrong');
}
```

The errors are re-thrown at the client library with the same interface.

```ts
import { UserController } from 'vovk-client';
import { HttpException } from 'vovk';

// ...
try {
    const updatedUser = await UserController.updateUser(/* ... */);
} catch(e) {
    console.log(e instanceof HttpException); // true
    const err = e as HttpException;
    console.log(err.message, err.statusCode);
}

```

Regular errors such as `Error` are equivalent to `HttpException` with code `500`.

```ts
import { HttpException, HttpStatus } from 'vovk';

// ...
static async updateUser(/* ... */) {
    // ...
    throw new Error('Something went wrong'); // 500
}
```

You can also throw custom objects that are going to be re-thrown on the client-side as is.

```ts
throw { hello: 'World' };
```


## Service

In order to make the code cleaner it's recommended to move most of the logic to Back-end Services. A Back-end service is a static class that serves as a library that performs database and third-party API calls outside of Controllers.

Imagine you have the following Controller:

```ts
// /src/modules/user/UserController.ts
import { prefix, put, type VovkRequest } from 'vovk';
import type { User } from '../../types';

@prefix('users')
export default class UserController {
    @put(':id') 
    static async updateUser(req: VovkRequest<Partial<User>>, { id }: { id: string }) {
        const data = await req.json();

        const updatedUser = await prisma.user.update({
            where: { id },
            data,
        });

        return updatedUser;
    }
}
```

Currently it looks nice since it doesn't contain a lot of logic. But as your app is getting more complex you're going to get more handlers and the handlers themselves are going to become bigger. At this case it's recommended to move part of the logic to Back-end service making controllers to be responsible for input extraction, validation and authorisation.

Let's refactor the class above by introducing `UserService`. For this example it's going to be small but I hope that illustrates the idea clearly.

```ts
// /src/modules/user/UserService.ts

// ... import types and Prisma client ...

export default class UserService {
    static async updateUser(id: string, data: Partial<User>) {
        return prisma.user.update({
            where: { id },
            data,
        });
    }
}
```

As you can see, `UserService` does not use decorators and served as a library to perform side-effects. By design it shoudln't interact with request object. 

The newly created service is injected into the controller with `private static` prefix. You can use `UserService` class directly but I find this way of dependency injection as more descriptive.

```ts
// /src/modules/user/UserController.ts
import { prefix, put, type VovkRequest } from 'vovk';
import UserService from './UserService'

@prefix('users')
export default class UserController {
    private static userService = UserService;

    @put(':id') 
    static async updateUser(req: VovkRequest<Partial<User>>, { id }: { id: string }) {
        const data = await req.json();
        return this.userService.updateUser(id, data);
    }
}
```

Back-end Services can inject other Back-end services (as well as Isomorphic Services explained in separate article of this documentation!!!!!).

```ts
// /src/modules/user/UserService.ts
import PostService from '../post/PostService';
import CommentService from '../comment/CommentService';
// ... other imports ...

export default class UserService {
    private static postService = PostService;

    private static commentService = CommentService;

    static async updateUser(id: string, data: Partial<User>) {
        const latestPost = this.postService.findLatestUserPost(id);
        const latestPostComments = this.commentService.findPostComments(latestPost.id);
        // ...
    }
}
```

In case if two services are dependent on each other in order to avoid errors you can apply a workaround that involves accessor definition. For example if `UserService` is using `PostService` and vice versa, the code of the services might look look like that:

```ts
// /src/modules/user/UserService.ts
import PostService from '../post/PostService';
// ... other imports ...

export default class UserService {
    private static get postService() {
        return PostService;
    };

    static async updateUser(id: string, data: Partial<User>) {
        const latestPost = this.postService.findLatestUserPost(id);
        // ...
    }

    static async doSomething() {
        // ...
    }
}
```

```ts
// /src/modules/post/PostService.ts
import UserService from '../user/UserService';
// ... other imports ...

export default class UserService {
    private static get userService() {
        return UserService;
    };

    static async doSometingWithUser(id: string, data: Partial<User>) {
        await this.userService.doSomething();
        // ...
    }

    static async findLatestUserPost(id: string) {
        // ...
    }
}
```

## Streaming

Vovk.ts provides two ways to implement response streaming requred for applications that utilise modern AI completions.

### Async iterators

Controller methods can implement generators that use `*` prefix and utilise `yield` keyword instead of regular `return`.

```ts
// /src/modules/stream/StreamController.ts
import { get, prefix } from 'vovk';

type Token = { message: string };

@prefix('stream')
export default class StreamController {
  @get('tokens')
  static async *streamTokens() {
    const tokens: Token[] = [
      { message: 'Hello,' },
      { message: ' World' },
      { message: '!' },
    ];

    for (const token of tokens) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      yield token;
    }
  }
}
```

In order to refactor this code and utilise Back-end Service you can move the streaming logic to `StreamService` static class.

```ts
// /src/modules/stream/StreamService.ts
type Token = { message: string };

export default class StreamService {
  static async *streamTokens() {
    const tokens: Token[] = [
      { message: 'Hello,' },
      { message: ' World' },
      { message: '!' },
    ];

    for (const token of tokens) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      yield token;
    }
  }
}
```

At the controller use `yield*` syntax to delegate iterable returned from `StreamService.streamTokens`.

```ts
import { get, prefix } from 'vovk';
import StreamService from './StreamService';

@prefix('stream')
export default class StreamController {
  private static streamService = StreamService;

  @get('tokens')
  static async *streamTokens() {
    yield* this.streamService.streamTokens();
  }
}
```

### StreamResponse

Sometimes it's too hard to use generators to implement response streaming in some cases. Vovk.ts introduces `StreamResponse` class inherited from `Response` that uses `TransformStream#readable` as body and adds required HTTP headers. It's a lower-level API that is used behind the scenes to implement generator logic explained above. `StreamResponse` is useful when your service method is implemented a regular function that accepts `StreamResponse` instance as a pointer to send messages manually.

There is what the streaming service might look like:

```ts
// /src/modules/stream/StreamService.ts
import type { StreamResponse } from 'vovk';

export type Token = { message: string };

export default class StreamService {
  static async streamTokens(resp: StreamResponse<Token>) {
    const tokens: Token[] = [
      { message: 'Hello,' },
      { message: ' World' },
      { message: '!' },
    ];

    for (const token of tokens) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      resp.send(token);
    }

    resp.close();
  }
}
```

As you can see tokens are sent using `StreamResponse#send` method.

The controller returns an instance of `StreamResponse` and tokens are streamed in a floating Promise.

```ts
import { prefix, get, StreamResponse, type VovkRequest } from 'vovk';
import StreamService, { type Token } from './StreamService';

@prefix('stream')
export default class StreamController {
  private static streamService = StreamService;

  @get('tokens')
  static async streamTokens() {
    const resp = new StreamResponse<Token>();

    void this.streamService.streamTokens(resp);

    return resp;
  }
}
```

`StreamResponse` class also provides `close` and `throw` methods. Both close the stream but the second one makes client-side re-throw the received error.

```ts
await resp.close();

await resp.throw(new Error('Stream error'));
```

### Handling Stream Responses on the Client

Both ways of response streaming generate client method that returns a disposable async generator. 

```ts
import { StreamController } from 'vovk-client';

{
    using stream = await StreamController.streamTokens();

    for await (const token of stream) {
        console.log(token);
    }
}
```

`using` keyword (that you can freely replace by `let` or `const`) indicates that when code block is reached the end (in case of early `break` or if the code block encountered an error) the stream is going to be closed by invoking `stream.close()` method automatically. `stream.close()` can also be called explicitly if needed.

To make sure that the stream is closed before moving to the next code block you can use `await using` syntax that disposes the stream asynchronous way.

```ts
import { StreamController } from 'vovk-client';

{
    await using stream = await StreamController.streamTokens();
    // ...
}
// on this line stream is already closed
```

## Validation with vovk-zod

**vovk-zod** is the library that implements [Zod](https://zod.dev/) validation. It performs validation on the Controller with `ZodModel.parse`, [converts the Zod object to a JSON Schema](https://www.npmjs.com/package/zod-to-json-schema) that's stored at the metadata file, and runs validation on client before the request is made with [Ajv](https://ajv.js.org/).

```ts
// /src/modules/user/UserController.ts
import vovkZod from 'vovk-zod';
import { z } from 'zod';
import { UpdateUserModel, UpdateUserQueryModel } from '../../zod';
// ... other imports ...

export default class UserController {
    @put(':id')
    @vovkZod(UpdateUserModel, UpdateUserQueryModel)
    static updateUser(
        req: VovkRequest<z.infer<typeof UpdateUserModel>, z.infer<typeof UpdateUserQueryModel>>
    ) {
        // ...
    }
}
```

To disable client-side validation you can pass `disableClientValidation: true` to the client method.

```ts
import { UserController } from 'vovk-client';

// ...
UserController.updateUser({
    // ...
    disableClientValidation: true,
})
```

`disableClientValidation` mostly useful for debugging purposes to make sure that server validation is properly functioning. In order to disable client validation completely (for example to hide validation logic from client-side so it doesn't appear in **.vovk.json**) you can set `exposeValidation: false` at `initVovk` function. 

```ts
// /src/app/api/[[...vovk]]/route.ts
// ...

export const { GET, POST, PUT, DELETE } = initVovk({ 
    controllers, 
    workers,
    exposeValidation: false,
});
```

## Type extraction

Vovk.ts provides a collection of useful types that described in more details at API documentation !!!!!. It's worthy to mention the most often used types shortly here. 

```ts
import { UserController, StreamController } from 'vovk-client';

// infer body
type Body = VovkClientBody<typeof UserController.updateUser>;
// infer query
type Query = VovkClientQuery<typeof UserController.updateUser>;
// infer params
type Params = VovkClientParams<typeof UserController.updateUser>;
// infer return type
type Return = VovkClientReturnType<typeof UserController.updateUser>;
// infer yield type from stream methods
type Yield = VovkClientYield<typeof StreamController.streamTokens>;
```

For example if you want to create a custom client-side function that makes request to the server, you can borrow types from the client to build arguments.

```ts
import { UserController } from 'vovk-client';

export function updateUser(
    id: VovkClientQuery<typeof UserController.updateUser>['id'],
    body: VovkClientBody<typeof UserController.updateUser>,
) {
    return UserController.updateUser({
        body,
        query: { id },
    });
}
```