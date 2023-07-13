# nextjs-api-router (WIP)

> Alternative syntax for route.ts that combine multiple endpoints with TypeScript decorators. Inspired by NestJS controller syntax.

**Warning**

The project does not have unit tests which means it's supposed to be used for experimental purposes only, but not for production apps. I'm going to add them in case if the idea actually looks interesting to other developers. For now it's just a personal project that I can install with NPM instead of copy-pasting the file every time. Give it a star if you want me to take this project more seriously.

Also worthy to mention that the router doesn't support dynamoc routes yet (`foo/:id/bar`) and you need to use query parameters instead.

----------------

Let's say tou have the following endpoints (an example from a real project).

- /api/users
- /api/users/me
- /api/chat-sessions
- /api/chat-sessions/chat-messages

Your regular file structure is going to look like that:

```
/users
  /route.ts
  /me
    /route.ts
/chat-sessions
  /route.ts
  /chat-messages
    /route.ts
```

With this library you need only 2 files:

```
/users/[[...]]/route.ts
/chat-sessions/[[...]]/route.ts
```

`[[...]]` folder name used for [Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes) with empty segment name.

## API

The library provides a function called `createRouter` that returns an object that contains NextJS route functions (`GET`, `POST`, `PUT`, `DELETE`) and decorators (`get`, `post`, `put`, `del`). The route handlers are going to be defined as a class with static methods (static method decorators are more flexible because they have access to the "target").

```ts
// 
import { createRouter } from 'TODO';

const { get, post, GET, POST } = createRouter();

export class Route {
  @get()
  static getAllUsers = (req: NextRequest) => { /* ... */ };

  @get('/me')
  static getMe = (req: NextRequest) => { /* ... */ };

  @post()
  static createUser = (req: NextRequest) => { /* ... */ }
}

export { GET, POST };
```

The route handlers need to return an object instead of `NextResponse.json`.

```ts
// ...
@get()
static helloWorld = () => {
  return { hello: 'world' };
}
// ...
```

The library also provides `HttpException` (as well as helpful enum `HttpStatus`) that you can throw at your route handler and the library will make the route return proper error and status.

```ts
// ...
@get()
static helloWorld = () => {
  if(somethingWrong) {
    throw HttpException(HttpStatus.BAD_REQUEST, 'Something is wrong')
  }

  return { hello: 'world' };
}
// ...
```

## Custom decorator

There is an example of a custom decorator that checks if user is authorised. `checkAuth` needs to be implemented based on how authorisation works in your app.

```ts
import { NextResponse, NextRequest } from 'next/server';
import { checkAuth } from './checkAuth';

export default function authGuard<T>() {
  return function (target: T, propertyKey: keyof T) {
    const originalMethod = target[propertyKey];
    if (typeof originalMethod === 'function') {
      // @ts-expect-error
      target[propertyKey] = async function (req: NextRequest, context?: any) {
        if (!req) return new NextResponse('req is not given at authGuard', { status: 401 });
        if (!(await checkAuth(req))) return new NextResponse('Unauthorised', { status: 401 });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return originalMethod.call(target, req, context);
      };
    }
  };
}

```
```ts

// ...
@get()
authGuard() // use it after HTTP method decorator
static helloWorld = (req: YourCustomReq) => { // you may want to add some extra properties to req (current user for example) at checkAuth
  return { hello: 'world' };
}
// ...
```











