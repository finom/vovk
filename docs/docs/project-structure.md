---
sidebar_position: 4
---

# Project Structure

This page explains how you could structure large web application introducing a framework that you can optionally apply to a large project that uses Vovk.ts.

The framework combines back-end and front-end code into one code base. The logical parts of the app are split into folders called "modules" (or "virtual modules") given them corresponding name such as user, post, comment, app settings, auth features etc. Besically, a module can belong to 2 categories:

1. An entity (a model) like "user" ("post", "comment" etc) requires to put all or most of the user code into "user" folder.
1. Anything what doesn't belong to some specific entity: app settings, auth, AI stuff... The typical structure of the app would look like that:

```
/src/modules
    /app
        /AppState.ts
        /AppWorkerService.ts
    /auth
        /AuthState.ts
        /AuthService.ts
        /AuthController.ts
    /hello
        /HelloState.ts
        /HelloService.ts
        /HelloIsomorphicService.ts
        /HelloWorkerService.ts
        /HelloState.ts
    /user
        /UserState.ts
        /UserService.ts
        /UserController.ts
        /UserIsomorphicService.ts
    /post
        /PostState.ts
        /PostService.ts
        /PostIsomorphicService.ts
        /PostController.ts
    /comment
        /CommentState.ts
        /CommentService.ts
        /CommentController.ts
```

Every item (service, controller, state etc) in a module folder is optional. Some parts of your app would require to have state only, but no controller. In another case you can have a State and a Controller, but database request in your controller is too simple to move it to a Service.

The image below illustrates how different components of the application can be related to each other.

![Vovk Framework](/img/vovk-framework.svg)

## Controller

Controller is a static class that defines API endpoints. It can use Back-end Services and Isomorphic Services explained below.

```ts
// /src/modules/post/PostController.ts
import { prefix, get } from 'vovk';
import PostService from './PostService';

@prefix('post')
export default class PostController {
    private static postService = PostService;
    
    @get()
    static getPosts() {
        return this.postService.getPosts();
    }
}
```

Decorators created with `createDecorator` make possible to validate request, throw errors, redirect, or return something different to the client.

```ts
// /src/modules/post/PostController.ts
import { prefix, get, type VovkRequest } from 'vovk';
import vovkZod from 'vovk-zod';
import { z } from 'zod';
import { authGuard } from '../../decorators';
import PostService from './PostService';

@prefix('post')
export default class PostController {
    private static postService = PostService;
    
    @put(':postId')
    @authGuard()
    @vovkZod(
        z.object({
            title: z.string()
            content: z.string(),
        }).strict(),
        z.object({
            moderationType: z.string(),
        }).strict()
    )
    static updatePost(
        req: VovkRequest<{ title: string; content: string; }, { moderationType: 'nice' | 'strict' }>, 
        { postId }: { postId: string }
    ) {
        const { title, content } = req.json();
        const moderationType = req.nextUrl.searchParams.get('moderationType');
        return this.postService.updatePost(postId, title, content, moderationType);
    }
}
```

Let's break down the example above that implements PUT endpoint that looks like that: `/api/post/69?moderationType=nice`.

- `authGuard` is a custom decorator that may be created by you based on your authorisation environment.
- `vovkZod` that's imported from [vovk-zod](https://github.com/finom/vovk-zod) performs Zod validation of body and query both on server-side and client-side.
- `VovkRequest` generic partially re-defines `NextRequest` type and makes `req.json` as well as `req.nextUrl.searchParams.get` return proper types.
- `this.postService.updatePost` is invoked with properly-typed arguments after authorisation check, body and query validation.

## Back-end Service

Back-end Service (or just "Service") is a static class that implements third-party API calls or performs requests do the project database. By design Services don't validate incoming data and play the role of back-end library.

Services can be injected to controllers as well as to other services using `private static` prefix.

```ts
// /src/modules/comment/CommentService.ts
import PostIsomorphicService from '../post/PostIsomorphicService';
import UserService from '../user/UserService';

export default class CommentService {
    private static postIsomorphicServiceService = PostIsomorphicService;

    private static userService = UserService;

    static getAllUserComments(userId: User['id']) {
        const user = await this.userService.getUserById(userId);
        // ... perform database request
        return // ...
    }
}
```


## Isomorphic Service

Isomorphic Service is very similar to a Back-end Service but can be used both by front-end (State, Components, Worker Service, hooks, other Isomorphic Services, ...) and back-end (Back-end Service, Controller, CLI scripts, ...). The only difference is that its methods need to be implemented as pure functions. It means that it shouldn't perform DB calls nor access application state but can use other Isomorphic Services. 

```ts
// /src/modules/comment/CommentIsomorphicService.ts
import PostIsomorphicService from '../post/PostIsomorphicService';

export default class CommentIsomorphicService {
    private static postIsomorphicService = PostIsomorphicService;

    // a pure function
    static filterCommentsByPostId(comments: Comment[], posts: Post, postId: Post['id']) {
        // findPostById is also a pure function
        const post = this.postIsomorphicService.findPostById(posts, postId);
        if(post.isDeleted) return [];
        return comments.filter((comment) => comment.postId === postId);
    }

    // ...
}
```


## Worker Service

Every isomorphic service can be turned into a Worker Service by applying `@worker()` decorator to its class. The decorator defines required `onmessage` listeners if it's imported in a Web Worker environment. In other cases `@worker()` decorator does nothing and still can be used as an Isomorphic Service.

```ts
// /src/modules/hello/HelloWorkerService.ts
import { worker } from 'vovk';

@worker()
export default class HelloWorkerService {
    static performHeavyCalculations() {
        // ...
    }
}
```

The worker can be promisified on the client-side.

```ts
// /src/app/page.tsx
import { HelloWorkerService } from '@vovkts/client';

// ...
const onClick = useCallback(async () => {
    HelloWorker.use(new Worker(new URL('../modules/hello/HelloWorkerService.ts', import.meta.url)));

    const result = await worker.performHeavyCalculations();

    console.log('result', result);
}, []);
```

Workers can use other Isomorphic Services, Worker Services and Back-end controllers imported from **@vovkts/client**. Please check documentation of [Worker Serices](./worker).

## State

State file contains application state code. It can use Isomorphic Services, Worker Services and Controllers imported from **@vovkts/client**. State can be implemented with any application state library: Recoil, Redux, Redux Toolkit, MobX, custom context, or anything else since the framework does not cover state management topic.

If a worker is initialised outside of `useEffect` or `useCallback` it's recommended to check if `Worker` exists in the current context and make the variable to equal `null` in SSR environment.

```ts
// /src/modules/post/PostState.ts
import { PostController, PostWorkerService } from '@vovkts/client';

const PostWorker = typeof Worker === 'undefined' ? null : PostWorkerService.use(
    new Worker(new URL('./HelloWorkerService.ts', import.meta.url))
);

export function updatePost() {
    return PostController.updatePost(/* ... */);
}

export function computeSomething() {
    return PostWorker?.calculateSomeNumber() ?? 0;
}

```

## Other ideas

The framework isn't limited by the elements described above and you may want to add more files into your module folder.

- More Back-end Services.
- More Isomorphic Services.
- More Worker Services.
- Tests.
- Some React Components that you want to categorise (`modules/hello/HelloComponents/MyComponent.tsx`).
- Some types (`modules/hello/HelloTypes.ts`).
- Anything else you can imagine.
