---
sidebar_position: 2
---

# Custom Decorators

## Overview

`createDecorator` is a higher-order function that produces a decorator factory (a function that returns a decorator). It accepts a middleware function with the following parameters:


- `request`, which extends `VovkRequest`.
- `next`, a function that should be invoked and its result returned to call subsequent decorators or the route handler.
- Additional arguments are passed through to the decorator factory.

Second argument is an optional init handler. It's called every time when decorator is initialised and it's used to populate **vovk-metadata.json** with information on client-side validation. For more info please check the [Validation](validation) page.

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

## `authGuard` example

There is the example code that defines `authGuard` decorator that does two things:

- Checks if a user is authorised and returns an Unauthorised status if not.
- Adds `currentUser` to the request object.

To extend `req` object you can define your custom interface that extends `VovkRequest`.

```ts
// /src/types.ts
import type { VovkRequest } from 'vovk'
import type { User } from '@prisma/client';

export interface GuardedRequest<BODY = undefined, QUERY extends Record<string, string> | undefined = undefined>
  extends VovkRequest<BODY, QUERY> {
  currentUser: User;
}

```

Then define the `authGuard` decorator itself.

```ts
// /src/decorators/authGuard.ts
import { HttpException, HttpStatus, createDecorator } from 'vovk';
import type { GuardedRequest } from '../types';

const authGuard = createDecorator(async (req: GuardedRequest, next) => {
  // ... define userId and isAuthorised
  // parse access token for example

  if (!isAuthorised) {
    throw new HttpException(HttpStatus.UNAUTHORIZED, 'Unauthorized');
  }

  // let's imagine you use Prisma and you want to find a user by userId
  const currentUser = await prisma.user.findUnique({ where: { id: userId } });

  req.currentUser = currentUser;

  return next();
});

export default authGuard;
```

And finally use the decorator as we did above:

```ts
// ...
export default class UserController {
  // ...
  @get('current-user')
  @authGuard()
  static async getCurrentUser(req: GuardedRequest</* ... */>) {
    return req.currentUser;
  }

  // ...
}
```
