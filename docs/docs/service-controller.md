---
sidebar_position: 1
---

# Service and Controler

## Back-end Service 

Back-end Service (or just "Service") is a static class that implements methods that perform DB requests or third-party calls. It can be used by Controllers and other Back-end Services. The methods can be retular functions or generators (incl. async generators) that are used for response streaming.


```ts
// /src/vovk/hello/HelloService.ts
export default class HelloService {
  static async getHello() {
    return { greeting: 'Hello world!' };
  }

  static async *getTokens() {
    // ...
    yield { message: 'Hello' }
  }
}
```

To inject one service to another use `pricate static` prefix to assign the injected service.


```ts
// /src/vovk/hello/HelloService.ts
import ByeService from '../bye/ByeService';

export default class HelloService {
  private static byeService = ByeService;

  static async getBye() {
    return this.byeService.getBye();
  }
}
```

## Controller

Controller is a static class that handles incoming HTTP requests and uses Services. The Services can be injected with `private static` static prefix.

```ts
// /src/vovk/hello/HelloController.ts
import { get, prefix } from "vovk";
import HelloService from "./HelloService"

@prefix('hello')
export default class HelloController {
    static controllerName = 'HelloController';
    
    private static helloService = HelloService;

    /**
     * Return a greeting from the HelloService
     */
    @get('greeting')
    static async getHello() {
        return this.helloService.getHello();
    }
}
```

- `@prefix` and `@get` build API endpoint `GET /api/hello/greeting`.
- `controllerName` is required to build **vovk-metadata.json**.
- `HelloService` is assigned as a `private static` and called at the route handler `getHello`.

All potential HTTP methods are supported.

```ts
import { get, post, put, patch, del, head, options } from 'vovk';
```

Controllers can be "clientized" using `clientizeController` to be used on the client-side. Please check Client documentation.

## `HttpException` class and `HttpStatus` enum

HttpException accepts 2 arguments. The first one is an HTTP code that can be retrieved from HttpStatus, the other one is error text.
```ts
import { HttpException, HttpStatus } from 'vovk';

// ...
throw new HttpException(HttpStatus.BAD_REQUEST, 'Something went wrong');
```

## `VovkRequest` type

Every route handler receives two arguments: request object and a record of parameters extracted from the route path. The request object defined as `VovkRequest<BODY, QUERY>` is the standard `NextRequest` object extended by body and query. It re-defines type of `NextRequest['json']` and `NextRequest['nextUrl']['searchParams']['get']` so you don't need to re-type body of `any` type or search param of `string | null` type.

```ts
// /src/vovk/post/PostController.ts
import { prefix, get, type VovkRequest } from 'vovk';
import { authGuard } from '../../decorators';
import PostService from './PostService';
import { PostId } from '../../types';

@prefix('post')
export default class PostController {
  private static postService = PostService;
  
  @put()
  static updatePost(
    req: VovkRequest<{ title: string; content: string; }, { id: PostId }>, 
  ) {
    const { title, content } = req.json(); // { title: string; content: string; }
    const id = req.nextUrl.searchParams.get('id'); // PostId
    const search = req.nextUrl.searchParams.get('search'); // never

    return this.postService.updatePost(id, title, content);
  }
}
```

At the example above `title` and `content` are recognised as strings and `id` param is recognised as `PostId`. `PostId` is an imaginary flavoured type defined like that:

```ts
// /src/types.ts
export type PostId = string & { __type: 'post' };
```