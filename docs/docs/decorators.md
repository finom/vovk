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

You can create a decorator that, first of all, validates request on the server-side and optionally populates controller metadata with validation information that is going to be used by the client.

The simplest example of the validation would be equality validation. It does nothing than checking if received query and body are equal to some definite object but has no practical use outside of this documentation.

At the example below `validateEquality` decorator is created with `createDecorator` that accepts 2 arguments: server validation function and init function that uses `clientValidators` object to indicate that validation information should be stored at **.vovk.json** file.

```ts
// /src/decorators/validateEquality.ts
import { isEqual } from 'lodash';
import { 
  HttpException, HttpStatus, createDecorator, type VovkRequest, type VovkClientOptions 
} from 'vovk';

type BodyValidate = Record<string, unknown> | null;
type QueryValidate = Record<string, string> | null;

const validateEquality = createDecorator(
  async (req: VovkRequest<unknown>, next, bodyValidate?: BodyValidate, queryValidate?: QueryValidate) => {
    if (bodyValidate) {
      const body = await req.json();

      // override req.json to make it to be called again by controller code
      req.json = () => Promise.resolve(body);

      if (!isEqual(body, bodyValidate)) {
        throw new HttpException(HttpStatus.BAD_REQUEST, 'Server exception. Invalid body');
      }
    }

    if (queryValidate) {
      const query = Object.fromEntries(req.nextUrl.searchParams.entries());

      if (!isEqual(query, queryValidate)) {
        throw new HttpException(HttpStatus.BAD_REQUEST, 'Server exception. Invalid query');
      }
    }

    return next();
  },
  (bodyValidate?: BodyValidate, queryValidate?: QueryValidate) => ({
    clientValidators: {
      body: bodyValidate,
      query: queryValidate,
    },
  })
);

export default validateEquality;
```

Then create a file that defines client-side validation function as default export. 

```ts
// /src/decorators/validateEqualityOnClient.ts
import { type VovkClientOptions, HttpException, HttpStatus } from 'vovk';
import { isEqual } from 'lodash';

// /src/decorators/validateEqualityOnClient.ts
const validateEqualityOnClient: VovkClientOptions['validateOnClient'] = (input, validators) => {
  if (validators.body) {
    if (!isEqual(input.body, validators.body)) {
      throw new HttpException(HttpStatus.NULL, `Client exception. Invalid body`);
    }
  }

  if (validators.query) {
    if (!isEqual(input.query, validators.query)) {
      throw new HttpException(HttpStatus.NULL, `Client exception. Invalid query`);
    }
  }
};

export default validateEqualityOnClient;
```

At this example `validateEquality` is used as a controller decorator and `validateEqualityOnClient` is used by the client. Also notice that `validateEqualityOnClient` throws `HttpException` with status `0` to simulate regular HTTP exceptions that can be caught by the client-side code.

Here is how the newly created decorator is used at controller.

```ts
// /src/modules/hello/HelloController.ts
import type { VovkRequest } from 'vovk';
import validateEquality from '../decorators/validateEquality';

export default class HelloController {
    @post.auto()
    @validateEquality({ foo: 42 }, { bar: 'hello' })
    static validatedRequest(req: VovkRequest<{ foo: 42 }, { bar: 'hello' }>) {
        // ...
    }
}
```

In order to enable client-side validation you need to define `validateOnClient` option in **vovk.config.js** file.

```js
/** @type {import('vovk').VovkConfig} */
const vovkConfig = {
    validateOnClient: `./src/decorators/validateEqualityOnClient`,
}

module.exports = vovkConfig;
```

If your validation library is published on NPM it needs to follow the same approach but use module name instead of local path to the file.

```js
/** @type {import('vovk').VovkConfig} */
const vovkConfig = {
    validateOnClient: `my-validation-library/validateEqualityOnClient`,
}

module.exports = vovkConfig;
```

For more info about Vovk.ts configuration check !!!!!! configuration page.

```ts
import { HelloController } from '@vovkts/client';

const result = await HelloController.validatedRequest({
    body: { foo: 42 },
    query: { bar: 'hello' },
});
```

`validateEqualityOnClient` is going to be invoked on every request before data is sent to the server.

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



