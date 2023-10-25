# next-wednesday 🐸 



<p align="center">
<img src="https://github.com/finom/nextjs-alternative-router/assets/1082083/6e1bd491-4d8f-4144-b57f-cefb20cd01e1" width="500"  />

<img src="https://badge.fury.io/js/next-wednesday.svg" alt="npm version" /> <img src="https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg" alt="TypeScript" /> <img src="https://github.com/finom/next-wednesday/actions/workflows/main.yml/badge.svg" alt="Build status" />

</p>

<p align="center">
A tiny <a href="https://bundlephobia.com/package/next-wednesday">zero-dependency</a> library that builds NextJS 13+ Route Handlers from decorated classes.
</p>


<!-- toc -->

- [next-wednesday 🐸](#next-wednesday-)
  - [Quick start](#quick-start)
  - [Features](#features)
  - [Overview](#overview)
    - [Why NextJS is great?](#why-nextjs-is-great)
    - [Why NextJS API routes suck?](#why-nextjs-api-routes-suck)
    - [A potential solution: Monorepo with NextJS + NestJS](#a-potential-solution-monorepo-with-nextjs--nestjs)
    - [The new solution: Next Wednesday 🐸](#the-new-solution-next-wednesday-)
      - [Custom decorators](#custom-decorators)
      - [Service-Controller pattern](#service-controller-pattern)
      - [Return type](#return-type)
      - [Error handling](#error-handling)
  - [API](#api)
    - [`createController`, global decorators and handlers](#createcontroller-global-decorators-and-handlers)
    - [`HttpException` and `HttpStatus`](#httpexception-and-httpstatus)

<!-- tocstop -->

## Quick start


Install: `npm i next-wednesday` or `yarn add next-wednesday`.

Create the first controller:

```ts
// /src/controllers/UserController.ts
import { get, post, prefix } from 'next-wednesday';

@prefix('users')
export default class UserController {
  @get()
  static getAll() {
    return { hello: 'world' };
  }

  @post("/:id")
  static async getOneUser(req: NextRequest, { id }: { id: string }) {
    return { hello: 'world', id };
  }
}
```

Finally, create the catch-all route with an optional slug (`[[...slug]]`). The slug is never used so you may want to keep it empty (`[[...]]`).

```ts
// /src/app/api/[[...]]/route.ts
import { RouteHandlers } from 'next-wednesday';
import './controllers/UserController';

export const { GET, POST } = RouteHandlers;
```

After that you can load the data using any fetching library.

```ts
fetch('/api/users');
fetch(`/api/users/${id}`, { method: 'POST' });
```

## Features

- Beautiful decorators syntax (all HTTP methods are available).
- Custom decorators for random needs are supported.
- Return data directly from the method (`Response` or `NextResponse` usage isn't required).
- Nice error handling (no need to use `try..catch` and `NextResponse` to return an error to the client).
- Service-Controller pattern is supported.
- Partial refactoring is possible if you want to quickly try the library or update only particular endpoints with an isolated controller (see `createController` docs below).

## Overview

### Why NextJS is great?

NextJS 13+ with App Controller is a great ready-to go framework that saves a lot of time and effort setting up and maintaining a React project. With NextJS:

- You don't need to manually set up Webpack, Babel, ESLint, TypeScript
- Hot module reload is enabled by default ans always works, so you don't need to find out why it stopped working after a dependency update
- Server-side rendering is enabled by default
- Routing and file structure is well-documented, so you don't need to design it by your own
- It doesn't require you to "eject" scripts and configs if you want to modify them
- It's a widely known and well-used framework, no need to spend time thinking of a choice

As result both lont-term and short-term the development is cheaper, faster and more effecient.

### Why NextJS API routes suck?

The pros mentioned above are about front-end part (code used by `page.tsx`, `layout.tsx`, `template.tsx` etc), but the API route handlers provide very specific and very limited way to define API routes. Per every endpoint you're going to create a separate file called `route.ts` that exports route handlers that implement an HTTP method corresponding to their name:

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
GET /user - get all users
POST /user - create user
GET /user/me - get current user
PUT /user/me - update current user (password, etc)
GET /user/[id] - get specified user by ID
PUT /user/[id] - update a specified user (let's say, name only) 
GET /team - get all teams
GET /team/[id] - get a specific team
POST /team/[id]/assign-user - some specialised endpoint that assigns a user to a specific team (whatever that means)
```

With the built-in NextJS 13+ features your API folder structure is going to look the following:

```
/api/user/
  /route.ts
  /me/
    /route.ts
  /[id]/
    /route.ts
/api/team/
  /route.ts
  /[id]/
    /route.ts
    /assign-user/
      /route.ts

```

It's hard to manage this file structure (especially if you have complex API), and you may want to apply some creativity to reduce number of files and simplify the structure:

- Move all features from /users folder (`/me` and `/[id]`) to `/user/route.ts` and use query parameter instead: `/user`, `/user/?who=me`, `/user/?who=[id]`
- Do the same trick with the teams: `/team`, `/team?id=[id]`, `/team?id=[id]&action=assign-user`

The file structure now looks like the following:

```
/api/user/
  /route.ts
/api/team/
  /route.ts
```

It looks better (even though it still looks wrong) but the code inside these files make you write too many `if` conditions and will definitely make your code less readable. To make this documentation shorter, let me rely on your imagination.

### A potential solution: Monorepo with NextJS + NestJS

Last few years I solved the problem above by combining NextJS and NestJS framework in one project. NextJS was used as a front-end framework and NestJS was used as back-end framework. Unfortunately this solution requires to spend resources on additional code and deployment management:

- Should it be a monorepo or 2 different repositories? 
  - Monorepo is harder to manage and deploy.
  - Two repos are harder to synchromise (if deployed back-end code and front-end code compatible to each other at this moment of time?).
- Both applications require to be run on their own port and we need to deploy them to 2 different servers.

It would be nice if we could:

- Use a single NodeJS project run in 1 port;
- Keep the project in one simple repository;
- Use single deployment server;
- Apply NestJS-like syntax to define routes;
- Make the project development cheaper.

### The new solution: Next Wednesday 🐸

NextJS includes [Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes) that enable us to create "catch-all" route handlers for a specific endpoint prefix. The library uses this feature to imepement creation of route handlers with much more friendly syntax. The route handlers are going to be exported on one catch-all route file. To achieve that you're going to need to create the following files:

```
/api/[[...]]/route.ts
/controllers
  /UserController.ts
  /TeamController.ts
```

First, `/controllers` is a folder that contains our dynamic controller files. The name of the folder nor files don't matter so you can name it `/routers` for example.

Create your controllers:

```ts
// /controllers/UserController.ts
import { get, post, put, prefix } from 'next-wednesday';

@prefix('/user')
export default class UserController {
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
// /controllers/UserController.ts
import { get, post, prefix } from 'next-wednesday';

@prefix('/team')
export default class TeamController {
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

Finally, create the catch-all route.

```ts
// /api/[[...]]/route.ts - this is a real file path where [[...]] is a folder name
import { RouteHandlers } from 'next-wednesday';
import '../controllers/UserController';
import '../controllers/TeamController';

export const { GET, POST, PUT } = RouteHandlers;
```

That's it. There are facts that you may notice:

- The syntax is very similar to [NestJS](https://nestjs.com/). But I don't have a goal to make another NestJS since it's over-engeneered in my opinion.
- The methods modified by the decorators defined as `static` methods and the classes are never instantiated.
- The returned values don't have to be instantiated from `NextResponse`, but they can if needed.

Also it's worthy to mention that `@prefix` decorator is just syntax sugar and you're not required to use it.

#### Custom decorators

You can extend features of the controller by definiing a custom decorator that can:

- Run additional checks, for example to check if user is authorised.
- Add more properties to the `req` object.

There is typical code from a random project:

```ts
// ...
export default class MyController {
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

To implement that you should use standard syntax to create ECMAScript decorators. In other words the library approaches decorator creation without using any custom helpers to do that. 

There is the example code that defines `authGuard` decorator that does two things:

- Checks if user authorised and returns Unauthorised status.
- Adds `currentUser` to the request object.

To extend `req` object you can define your custom interface that extends `NextRequest`.

```ts
// types.ts
import { type NextRequest } from 'next/server'
import { type User } from '@prisma/client';

export default interface GuardedRequest extends NextRequest {
  currentUser: User;
}
```

Then define the `authGuard` decorator itself.

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
      target[propertyKey] = async function (req: GuardedRequest, context?: unknown) {
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
  // ... define userId and isAuthorised
  // parse access token for example

  if(!isAuthorised) {
    return false;
  }

  const currentUser = await prisma.user.findUnique({ where: { id: userId } });

  req.currentUser = currentUser;

  return true;
}
```


And finally use the decorator as we did above:

```ts
// ...
export default class UserController {
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

Optionally, you can improve your controller code by splitting it into service and controller. Service is a place is where you make database requests. Controller is where we use the decorators, check permissions and incoming data for validity and call methods of the service. To achieve that simply create another class with static methods:


```ts
// /controllers/users/UserService.ts
export default class UserService {
  static findAllUsers() {
    return prisma.user.findMany();
  }
}

```

Then inject the service as another static property to the controller

```ts
// /controllers/users/UserController.ts
import UserService from './UserService';

// ...
@prefix('/user')
export default class UserController {
  static userService = UserService;

  @get('/')
  @authGuard()
  static getAllUsers() {
    return this.userService.findAllUsers();
  }
}

```

Then initialise the controller as before:

```ts
// /api/[[...]]/route.ts
import { RouteHandlers } from 'next-wednesday';
import '../controllers/user/UserController';

export const { GET } = RouteHandlers;
```

Potential file structure with users, posts and comments may look like that:

```
/controllers/
  /user/
    /UserService.ts
    /UserController.ts
  /post/
    /PostService.ts
    /PostController.ts
  /comment/
    /CommentService.ts
    /CommentController.ts
```


#### Return type

Controller method can return an instance of `NextResponse` (as well as native `Response`) as well as custom data. Custom data is serialised to JSON and returns with status 200.

```ts
@get()
static getSomething() {
  // same as NextResponse.json({ hello: 'world' }, { status: 200 })
  return { hello: 'world' };
}
```


#### Error handling

You can throw errors directly from the controller method. The library catches thrown exception and returns an object of type `ErrorResponseBody`.

```ts
// some client-side code
import { type ErrorResponseBody } from 'next-wednesday';

const dataOrError: MyData | ErrorResponseBody = await (await fetch()).json();
```

To throw an error you can use `HttpException` class together with `HttpStatus` enum. You can also throw the errors from the service methods.

```ts
import { HttpException, HttpStatus } from 'next-wednesday'

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

Regular exceptions are considered as 500 errors and handled similarly.

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
  // main API
  type ErrorResponseBody, 
  HttpException, 
  HttpStatus, 
  createController,

  // global controller members created with createController
  get, post, put, patch, del, head, options, 
  prefix, 
  RouteHandlers,
} from 'next-wednesday';
```

### `createController`, global decorators and handlers

The function `createController` initialises route handlers for one particular app segment and creates isolated controller. Using the function directly allows you to isolate some particular route path from other route handlers and provides a chance to refactor your code partially. Let's say you want to override only `/user` route handlers by using the library but keep `/comment` and `/post` as is. 


```
/api/post/
  /route.ts
  /[id]/
    /route.ts
/api/comment/
  /route.ts
  /[id]/
    /route.ts
/api/user/[[...]]/
  /route.ts
```

At this example only the `user` dynamic route is going to use the library. With `createController` you can define local variables that are going to be used for one particular path. At this case the controller class is going to be extended by `RouteHandlers` class.

```ts
import { createController } from 'next-wednesday';

const { get, post, RouteHandlers } = createController();

class UserRoute extends RouteHandlers {
  @get()
  static getAll() {
    // ...
  }

  @post()
  static create() {
    // ...
  }
}

export const { GET, POST } = UserRoute;
```

There is what `createController` returns:

```ts
const {  
  get, post, put, patch, del, head, options, // HTTP methods
  prefix, 
  RouteHandlers, 
} = createController();
```

(notice that DELETE method decorator is shortned to `@del`).

`RouteHandlers` includes all route handlers for all supported HTTP methods.

```ts
export const { GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD } = RouteHandlers;
```

As you may already guess, some of the the variables imported from the library are created by `createController` to keep the code cleaner for the "global" controller instance.

```ts
// these vars are initialised within the library by createController
import {
  get, post, put, patch, del, head, options, 
  prefix, 
  RouteHandlers,
} from 'next-wednesday';
```


### `HttpException` and `HttpStatus`

`HttpException` accepts 2 arguments. The first one is an HTTP code that can be retrieved from `HttpStatus`, the other one is error text.

```ts
throw new HttpException(HttpStatus.BAD_REQUEST, 'Something is wrong');
```

Enjoy!
