

<!-- toc -->

- [WIP](#wip)
    - [Features](#features)
  - [Overview](#overview)
    - [Why NextJS is great?](#why-nextjs-is-great)
    - [Why NextJS sucks?](#why-nextjs-sucks)
    - [Previous solution: Monorepo and NestJS](#previous-solution-monorepo-and-nestjs)
    - [New solution: The library](#new-solution-the-library)
      - [Custom decorators](#custom-decorators)
      - [Service-Controller pattern](#service-controller-pattern)
      - [Return type](#return-type)
      - [Error handling](#error-handling)
  - [API](#api)
    - [`createRouter`, global decorators and handlers](#createrouter-global-decorators-and-handlers)
    - [`HttpException` and `HttpStatus`](#httpexception-and-httpstatus)

<!-- tocstop -->

# WIP

The library allows to define wildcarded API route handlers for NextJS 13+ App router.

```ts
// /routers/UsersRouter.ts
import { get, post, prefix } from 'thelibrary';

@prefix('/users')
export default class UsersRouter {
  @get()
  static getAll() {
    return someORM.getAllUsers();
  }

  @post(`/:id`)
  static async getOneUser(req: NextRequest, { id }: { id: string }) {
    return someORM.getUserById(id);
  }
}
```

### Features

- Nice error handling - no need to use `try..catch` and `NextResponse` to return an error to the client.
- Custom decorators that allow you to extend route features in a nice and laconic way.
- Service-Controller pattern is supported.
- Partial refactoring is possible (if you want to quickly try the library or update only particular endpoints).

## Overview

### Why NextJS is great?

NextJS 13+ with App Router is a great ready-to go framework that saves a lot of time and effort setting up and maintaining a React project. With NextJS:

- You don't need to manually set up Webpack, Babel, ESLint, TypeScript
- Hot module reload is enabled by default and doesn't work in your environment
- Server-side rendering is also enabled by default
- Routing and file structure is well-documented, so you don't need to design it by your own
- It doesn't require you to "eject" build scripts and configs if you want to modify 
- It's a widely known and well-used framework, no need to spend time arguing with other team members about the choice

As result both lont-errm and short-term development is cheaper, faster and more effecient.

### Why NextJS sucks?

The pros mentioned above mostly about front-end part (code used by `page.tsx`, `layout.tsx`, `template.tsx` etc), but the API route handlers provide very specific and very limited way to define API routes. Per every endpoint you're going to create a separate file called `route.ts` that exports route handlers that implement an HTTP method corresponding to their name:

```ts
export async function GET() {
  // ...
  return NextResponse.json(data)
}

export async function POST() {
  // ...
  return NextResponse.json(data)
}
```

Let's imagine that your app requires to build the following endpoints:

```
GET /users - get all users
POST /users - create users
GET /users/me - get current user
PUT /users/me - update current user (password, etc)
GET /users/[id] - get specified user by ID
PUT /users/[id] - update a specified user (let's say, name only) 
GET /teams - get all teams
GET /teams/[id] - get a specific team
POST /teams/[id]/assign-user - some specialised endpoint that assigns a user to a specific team (whatever that means)
```

With the built-in NextJS 13+ features your API folder structure is going to look the following:

```
/api/users/
  /route.ts
  /me/
    /route.ts
  /[id]/
    /route.ts
/api/teams/
  /route.ts
  /[id]/
    /route.ts
    /assign-user/
      /route.ts

```

You need to be a psychopath to keep this file structure (especially if you have complex API), or you have to apply some creativity to reduce number of files and simplify the structure:

- Move all features from /users folder (`/me` and `/[id]`) to `/users/route.ts` and use query parameter instead: `/users`, `/users/?who=me`, `/users/?who=[id]`
- Do the same trick with teams: `/teams`, `/teams?id=[id]`, `/teams?id=[id]&action=assign-user`

The file structure now looks like the following:

```
/api/users/
  /route.ts
/api/teams/
  /route.ts
```

It looks better but the code inside these files make you write too many `if` conditions and will definitely make your code less readable. To make this documentation shorter, let me rely on your imagination.

### Previous solution: Monorepo and NestJS

Last few years I solved the problem above by combining NextJS and NestJS framework in one project. NextJS was used as a front-end framework and NestJS was used as back-end framework. Unfortunately this solution requires to spend resources on additional code management:

- Should it be a monorepo or 2 different repositories? 
  - Monorepo is harder to manage and deploy
  - Two repos are harder to synchromise (if deployed back-end code and front-end code compatible to each other at this moment of time?).
- Both applications require to be run on their own port and we need to deploy them to 2 different servers.

Wouldn't it be nice if we could:

- Make the project development cheaper;
- Use a single NodeJS project run in 1 port;
- Keep the project in one simple repository;
- Use single deployment server;
- Apply NestJS-like syntax to define routes?

### New solution: The library

NextJS includes [Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes) that enable us to create "catch-all" route handlers for a specific endpoint prefix. The library uses this feature to imepement creation of route handlers with much more friendly syntax. The route handlers are going to be exported on one catch-all route file. To achieve that you're going to need to create the following files:

```
/api/[[...]]/route.ts
/routers
  /UsersRouter.ts
  /TeamsRouter.ts
```

First, `/routers` is a folder that contains our dynamic router files. The name of the folder nor files don't matter.

Create your routers:


```ts
// /routers/UsersRouter.ts
import { get, post, put, prefix } from 'thelibrary';

@prefix('/users')
export default class UsersRouter {
  @get()
  static getAll() {
    return someORM.getAllUsers();
  }

  @get('/me')
  static getMe() {
    // ...
  }

  @put('/me')
  static async updateMe(req: NextRequest) {
    const body = await req.json() as { fiestName: string; lastName: string; };
    // ...
  }

  @get(`/:id`)
  static async getOneUser(req: NextRequest, { id }: { id: string }) {
    return someORM.getUserById(id);
  }

  @put('/:id')
  static async updateOneUser(req: NextRequest, { id }: { id: string }) {
    const body = await req.json() as { fiestName: string; lastName: string; };

    return someORM.updateUserById(id, body);
  }
}
```

```ts
// /routers/UsersRouter.ts
import { get, post, prefix } from 'thelibrary';

@prefix('/teams')
export default class TeamsRouter {
  @get('/')
  static getAll() {
     return someORM.getAllTeams();
  }

  @get('/:id')
  static getOneTeam(req: NextRequest, { id }: { id: string }) {
    // ...
  }

  @post('/:id/assign-user') 
  static assignUser() {
    // ...
  }
}
```

Finally, create the catch-all route with an optional slug (`[[...slug]]`). The slug is never used so you may want to keep it empty (`[[...]]`).


```ts
// /api/[[...]]/route.ts - this is a real file path where [[...]] is a folder name
import { RouteHandlers } from 'thelibrary';
import '../routers/UsersRouter';
import '../routers/TeamsRouter';

export const { GET, POST, PUT } = RouteHandlers;
```

That's it. There are facts that you may notice:

- As you may notice the syntax is very similar to [NestJS](https://nestjs.com/). But I don't have a goal to make another NestJS since it's over-engeneered in my opinion.
- The methods modified by the decorators defined as `static` methods and the classes are never instantiated.
- The returned values don't have to be instantiated from `NextResponse`, but they can if needed.

Also it's worthy to mention that `@prefix` decorator is just syntax sugar and you're not required to use it.

#### Custom decorators

You can extend features of the router by definiing a custom decorator that can:

- Run additional checks, for example to check if user is authorised
- Add more properties to the `req` object.

There is typical code from a random project:

```ts
// ...
export default class MyRouter {
  // ...

  @post()
  @authGuard()
  @permissionGuard(Permission.CREATE)
  @handleZodErrors()
  static async create(req: GuardedRequest) {
    // MyModel is a zod object
    const body = MyModel.parse(await req.json());

    return this.myService.create(body);
  }

  // ...
}
```

To implement that you should use standard syntax to create ECMAScript decorators. In other words the library approaches decorator creation without using any built-in helpers to do that. There is the example code that defines `authGuard` decorator.

First, if you want to extend `req` object you can define your custom interface that extends `NextRequest`.

```ts
import { type NextRequest } from 'next/server'
import { type User } from '@prisma/client';

// types.ts
export default interface GuardedRequest extends NextRequest {
  currentUser: User;
}
```

Define the `authGuard` decorator itself.

```ts
// authGuard.ts
import { NextResponse } from 'next/server';
import checkAuth from './checkAuth';
import { GuardedRequest } from './types';

export default function authGuard<T>() {
  return function (target: T, propertyKey: keyof T) {
    const originalMethod = target[propertyKey];

    if (typeof originalMethod === 'function') {
      // @ts-expect-error
      target[propertyKey] = async function (req: GuardedRequest, context?: any) {
        if (!(await checkAuth(req))) {
          return new NextResponse('Unauthorised', { status: 401 });
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return originalMethod.call(target, req, context);
      };
    }
  };
}
```

Implement `checkAuth` by your own based on the auth environment you use.

```ts
// checkAuth.ts
import { GuardedRequest } from './types';

export default function checkAuth(req: GuardedRequest) {
  // ... define userId and isAuthorised ...
  if(!isAuthorised) {
    return false;
  }

  const currentUser = await prisma.user.findUnique({ where: { id: userId } });

  req.currentUser = currentUser;

  return true;
}
```


And finally use the decorator as shown above:

```ts
// ...
export default class UsersRouter {
  // ...
  @get('/me')
  @authGuard()
  static async getMe(req: GuardedRequest) {
    return req.currentUser;
  }

  // ...
}
```

#### Service-Controller pattern

Optionally, you can improve your router code by splitting it into Service and Controller. Service is where you make database requests. Controller is where we use the decorators, check permissions and incoming for validity. To achieve that simply create another class with static methods:


```ts
// /routers/users/UsersService.ts
export default class UsersService {
  static findAllUsers() {
    return prisma.user.findMany();
  }
}

```

Then inject the service as another static property to the router (the controller)

```ts
// /routers/users/UsersRouter.ts
import UsersService from './UsersService';

// ...
@prefix('/users')
export default class UsersRouter {
  static usersService = UsersService;

  @get('/')
  @authGuard()
  static getAllUsers() {
    return this.usersService.findAllUsers();
  }
}

```

Then initialise the router as before:

```ts
// /api/[[...]]/route.ts
import { RouteHandlers } from 'thelibrary';
import '../routers/UsersRouter';

export const { GET } = RouteHandlers;
```


#### Return type

Router method can return an instance of `NextResponse` (as well as native `Response`) as well as custom data. Custom data is serialised to JSON and returns with status 200.

```ts
@get()
static getSomething() {
  // same as NextResponse.json({ hello: 'world' }, { status: 200 })
  return { hello: 'world' };
}
```


#### Error handling

You can throw errors directly from the router method. The library catches thrown exception and returns an object of type `RouterErrorResponse`.

```ts
// some client-side code
import { RouterErrorResponse } from 'thelibrary';

const dataOrError: MyData | RouterErrorResponse = await (await fetch()).json();
```

To throw an error you can use `HttpException` class together with `HttpStatus` enum. You can also throw the errors from the service.


```ts
import { HttpException, HttpStatus } from 'thelibrary'

// ...
@get()
static getSomething() {
  if(somethingWrong) {
    throw new HttpException(HttpStatus.I_AM_A_TEAPOT, "I'm a teapot");
  }
  // ...
}
// ...
```

Regular errors (thrown by your code or by something else) are considered as 500 errors and handled correspondingly.

```ts
// ...
@get()
static getSomething() {
  if(somethingWrong) {
    throw new Error('Something is wrong');
  }
  // ...
}
// ...
```


## API

```ts
import { 
  // main
  type RouterErrorResponse, 
  HttpException, 
  HttpStatus, 
  createRouter,

  // global router members created with createRouter
  get, post, put, patch, del, head, options, 
  prefix, 
  RouteHandlers,
} from 'thelibrary';
```

### `createRouter`, global decorators and handlers

The function `createRouter` initialises route handlers for one particular app segment. Using it directly allows you to isolate some particular route path from other route handlers and provides a chance to refactor your code partially. Let's say you want to override only `/users` route handlers by using the library. 


```
/api/posts/
  /route.ts
  /[id]/
    /route.ts
/api/comments/
  /route.ts
  /[id]/
    /route.ts
/api/users/[[...]]/
  /route.ts
```

At this example you keep your `posts` and `comments` untouched but `users` router is going to use the library. You can define local variables that are going to be used for one particular path. The router class is going to be extended by `RouteHandlers` class.

```ts
import { createRouter } from 'thelibrary';

const { get, post, RouteHandlers } = createRouter();

class UsersRoute extends RouteHandlers {
  @get()
  static getAll() {
    // ...
  }

  @post()
  static create() {
    // ...
  }
}

export const { GET, POST } = UsersRoute;
```

The full example of `createRouter` call:

```ts
const {  
  get, post, put, patch, del, head, options, // HTTP methods
  prefix, 
  RouteHandlers, 
} = createRouter();
```

(notice that DELETE method decorator is shortned to `@del`).

`RouteHandlers` includes all route handlers for all supported HTTP methods.

```ts
export const { GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD } = RouteHandlers;
```

As you may already guess, some of the the variables imported from the library are created by `createRouter` to keep the code cleaner for the "global" router.


```ts
// these vars are initialised within the library with createRouter
import {
  get, post, put, patch, del, head, options, 
  prefix, 
  RouteHandlers,
} from 'thelibrary';
```


### `HttpException` and `HttpStatus`

`HttpException` accepts 2 arguments. The first one is an HTTP code that can be retrieved from `HttpStatus`, the other one is error text.

```ts
throw new HttpException(HttpStatus.BAD_REQUEST, 'Something is wrong');
```

Enjoy!