---
sidebar_position: 6
---

# The Vovk Architecture

**Vovk.ts** combines back-end and front-end code into one code base. The logical parts of the app are split into folders called "modules" (or "virtual modules") given them corresponding name. The folders are split into "things" such as user, post, comment, app settings, auth features etc. Besically "a thing" can belong to 2 categories:

1. An entity (a model) like "user" or "post" requires to put all or most of the user code into "user" folder.
1. Anything what doesn't belong to some specific entity: app settings, auth, AI stuff... The typical structure of the app would look like that:

```
/src/vovk
    /vovk-metadata.json
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

Every item (service, controller, state etc) in a module folder is optional. Some parts of your app would require to have state only, but no controller. In other case you can have a state and controller, but database request in your controller is too simple to move it to a Service.

The Vovk Architecture extends Service-Controller-Repository pattern by adding State, Isomorphic Service, Worker Service, so the full name of this pattern would be Service-Controller-Repository-IsomorphicService-WorkerService-State-View. Unfortunately the best acronym I found sounded like "Screw it", that's why I simply call it "The Vovk Architecture" instead of using an acronym like MVC.

The image below illustrates how different components of the application import each other: thru regular `import` or `import type` + `import metadata`.

![The Vovk Architecture](/img/vovk-architecture.svg)

## Controller

Controller is a static class that defines API endpoints. It can use Back-end Services and Isomorphic Services explained below. Controller is a static class that can be decorated with Vovk decorators that indicate their behaviour.

```ts
// /src/vovk/post/PostController.ts
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

Decorators created with `createDecorator` make possible to validate request, throw errors, redirect, or return something different.

```ts
// /src/vovk/post/PostController.ts
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
        req: VovkRequest<{ title: string; content: string; }, { moderationType: string }>, 
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
- `this.postService.updatePost` is invoked with properly-typed arguments after authorisation check, body validation and query validation.

Controllers can be "clientized" on the client-side to make it look like you call Controller methods directly. Requests first validated on the client-side using a validation library like **vovk-zod** used above.

```ts
// /src/vovk/post/PostState.ts
import { clientizeController } from 'vovk/client';
import { zodValidateOnClient } from 'vovk-zod';
import type HelloController from './HelloController';
import metadata from '../vovk-metadata.json' assert { type: 'json' };

const controller = clientizeController<typeof HelloController>(metadata.HelloController, {
    validateOnClient: zodValidateOnClient,
});

// ...
await controller.updatePost({
    body: { title: 'Hello', content: 'World' },
    query: { moderationType: 'strict' }
});
```

## Back-end Service

Back-end Service (or just "Service") is a static class that implements third-party API calls or performs requests do the project database. By the pattern design Back-end Service does not validate incoming data. It doesn't require any decorators to be used and plays the role of a back-end library for your module. 

```ts
// /src/vovk/comment/CommentService.ts
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

Services can be injected to a controller or other services using `private static` prefix. The `private` keyword is useful with ESLint and/or VSCode: they're going to indicate if no method uses the service.

## Isomorphic Service

Isomorphic Service is very similar to a Back-end Service but can be used both by front-end (State, Components, Worker Service, hooks, other Isomorphic Services ...) and back-end (Back-end Service, Controller, CLI scripts). The only difference is that its methods need to be pure functions (besides using `console` object). It means that it shouldn't perform DB calls nor access application state but can use other Isomorphic Services. 

```ts
// /src/vovk/comment/CommentIsomorphicService.ts
import PostIsomorphicService from '../post/PostIsomorphicService';

export default class CommentIsomorphicService {
    private static postIsomorphicService = PostIsomorphicService;

    // pure function
    static filterCommentsByPostId(comments: Comment[], posts: Post, postId: Post['id']) {
        // also pure function
        const post = this.postIsomorphicService.getPostById(posts, postId);
        if(post.isDeleted) return [];
        return comments.filter((comment) => comment.postId === postId);
    }

    // ...
}
```


## Worker Service

Every isomorphic service can be turned into a Worker Service by applying `@worker()` decorator to its class. The decorator defines required `onmessage` listeners if it's imported in a Web Worker environment. In other cases `@worker()` decorator does nothing and still can be used as an Isomorphic Service.

```ts
// /src/vovk/hello/HelloWorkerService.ts
import { worker } from 'vovk/worker';

@worker()
export default class HelloWorkerService {
    static workerName = 'HelloWorkerService';

    static performHeavyCalculations() {
        // ...
    }
}
```

The worker can be promisified on the client-side.

```ts
// app/page.tsx
import type HelloWorkerService from '../vovk/hello/HelloWorkerService';
import metadata from '../vovk/vovk-metadata.json';

// ...
const onClick = useCallback(async () => {
    const worker = promisifyWorker<typeof HelloWorkerService>(
        new Worker(new URL('../vovk/hello/HelloWorkerService.ts', import.meta.url)),
        metadata.workers.HelloWorkerService,
    );

    const result = await worker.performHeavyCalculations();

    console.log('result', result);
}, []);
```

Workers can use other Isomorphic Services, Worker Services (using `promisifyWorker`) and Back-end controllers using `clientizeController`. Please check documentation of Worker Serices.

## State

State file contains application state code corresponding to the module. It can use Isomorphic Services, promisified Worker Services and clientized controllers. State can be implemented with any application state library: Recoil, Redux, Redux Toolkit, MobX, custom context, or anything else because **Vovk.ts** does not cover state management topic.

If a promisified worker is initialised outside of `useEffect` or `useCallback` it's recommended to check if `Worker` exists in the current context and make the variable to equal `null` in SSR environment.

```ts
// /src/vovk/post/PostState.ts
import { clientizeController } from 'vovk/client';
import { promisifyWorker } from 'vovk/worker';
import type PostController from './PostController';
import type PostWorkerService from './PostWorkerService';
import metadata from '../vovk-metadata.json' assert { type: 'json' };

const controller = clientizeController<typeof PostController>(metadata.PostController);

const worker = typeof Worker !== 'undefined' ?
    promisifyWorker<typeof PostWorker>(
        new Worker(new URL('./PostWorkerService.ts', import.meta.url)),
        metadata.workers.PostWorker
    ) : null;

export function updatePost() {
    return controller.updatePost(/* ... */);
}

export function computeSomething() {
    return this.worker?.calculateSomeNumber() ?? 0;
}

```

## Other ideas

The Vovk Architecture isn't limited by the things described above. I can imagine that you may want to add more files into your module folder.

- More Isomorphic Services to simplify the code.
- More Worker Services.
- Tests.
- Some React Components that you want to categorise (`vovk/hello/HelloComponents/MyComponent.tsx`).
- Some types (`vovk/hello/HelloTypes.ts`).
- Anything else you can imagine.
