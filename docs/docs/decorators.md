---
sidebar_position: 3
---

# Custom Decorators

## Overview

`createDecorator` is a higher-order function that produces a decorator factory (a function that returns a decorator). It accepts a middleware function with the following parameters:

- `request`, which extends `NextRequest` as well as `VovkRequest`.
- `next`, a function that should be invoked and its result returned to call subsequent decorators or the route handler.
- Additional arguments are passed through to the decorator factory.

Second argument is an optional init handler. It's called every time when decorator is initialised and it's used to populate **.vovk.json** with information on client-side validation explained below.

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
  static doSomething() {
    // ...
  }
}
```

## Authorisation decorator example

There is an example code that defines `authGuard` decorator that does two things:

- Checks if a user is authorised and returns an Unauthorised status if not.
- Adds `currentUser` to the request object.

To extend `req` object you can define your custom interface that extends `VovkRequest`. Let's imagine that Prisma ORM is used at the project.

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

  const currentUser = await prisma.user.findUnique({ where: { id: userId } });

  req.currentUser = currentUser;

  return next();
});

export default authGuard;
```

And finally use the decorator and define request object with your newly created `GuardedRequest` type.

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

## Request Input Validation

**Vovk.ts** offers API that allows to validate request body and query string on back-end and, thanks to the metadata mechanism, performs zero-cost validation on client-side before request to the server is even made.

### vovk-zod

**vovk-zod** is the library that implements [Zod](https://zod.dev/) validation. It performs validation on the Controller side with `ZodModel.parse`, [converts the Zod object to a JSON Schema](https://www.npmjs.com/package/zod-to-json-schema) that's stored at **.vovk.json** file, and runs validation on client before the HTTP request is made with [Ajv](https://ajv.js.org/).

```ts
// /src/modules/user/UserController.ts
import { z } from 'zod';
// ... other imports ...

const UpdateUserModel = z.object({ name: z.string(), email: z.email() }).strict();
const UpdateUserQueryModel = z.object({ id: z.uuid() }).strict();

export default class UserController {
    private static userService = UserService;

    @put.auto()
    @vovkZod(UpdateUserModel, UpdateUserQueryModel)
    static updateUser(
        req: VovkRequest<z.infer<typeof UpdateUserModel>, z.infer<typeof UpdateUserQueryModel>>
    ) {
        const { name, email } = await req.json();
        const id = req.nextUrl.searchParams.get('id');

        return this.userService.updateUser(id, { name, email });
    }
}
```

### Creating a custom validation library

If you need to create your custom validation library, check [cusromization documentation](./customization).

### Disable client validation

You can set `disableClientValidation` option mentioned above to `true` to disable client validation for debugging purposes.

```ts
const result = await HelloController.validatedRequest({
    body: { foo: 42 },
    query: { bar: 'hello' },
    disableClientValidation: true,
});
```

If you want to disable it completely and remove it from **.vovk.json** file (in case if you want to hide server-side validation implementation) you can use `exposeValidation` option set to `false` at the Next.js wildcard router level.

```ts
// /src/api/[[...vovk]]/route.ts
// ...
export const { GET, POST, PATCH, PUT } = initVovk({
    controllers,
    workers,
    exposeValidation: false // don't populate metadata file with validation information
});
```



