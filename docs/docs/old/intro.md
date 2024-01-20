---
sidebar_position: 0
---

# Getting Started

## Quick install

Setup Vovk.ts with [create-next-app](https://www.npmjs.com/package/create-next-app).

```
npx create-next-app -e https://github.com/finom/vovk-hello-world
```

Inside the project folder run `npm run dev` and open [http://localhost:3000](http://localhost:3000).

## Manual install

### 1. Create Next.js project with App Router and install Vovk.ts

Follow [this instruction](https://nextjs.org/docs/getting-started/installation) to install Next.js. Use TypeScript, App Router and `src/` directory. If you're using **create-next-app** you can simply answer to all questions "Yes".

```
npx create-next-app
```

![](https://github.com/finom/vovk/assets/1082083/b9e600da-a43a-4e30-a089-43e5e4b147ef)


At the newly created folder run:

```
npm i vovk
```


### 2. Enable decorators

In your **tsconfig.json** set `"experimentalDecorators"` to `true`.

```json
{
    "compilerOptions": {
        "experimentalDecorators": true,
        // ...
    }
}
```

### 3. Set up Next.js wildcard route handler

Create file **/src/app/api/[[...]]/route.ts** where **[[...]]** is a real folder name indicating an empty slug. This is the core entry point for all **Vovk.ts** routes.

```ts
// /src/app/api/[[...]]/route.ts
import { initVovk } from 'vovk';

export const { GET, POST, PUT, DELETE } = initVovk({
  controllers: [],
  async onMetadata(metadata, write) {
    if (process.env.NODE_ENV === 'development') {
      const [fs, path] = await Promise.all([import('fs/promises'), import('path')]);
      const metadataPath = path.join(
        __dirname.replace('.next/server/app', 'src/vovk'),
        '../../vovk-metadata.json'
      );

      await write(metadataPath, metadata, { fs, path });
    }
  },
});
```

For now the `controllers` array is empty. Notice the `onMetadata` option. It's called whenever the Next.js route is initialised. The function provides two arguments: `metadata` - the metadata of controllers and workers, and `write` - a function created to shorten the code that checks if metadata is changed and updates the metadata file. Let's breakit down.

- `process.env.NODE_ENV === 'development'` checks if mode is development. In other words, the code inside isn't called in production and **vovk-metadata.json** is created on the local machine.
- `const [fs, path] = await Promise.all([import('fs/promises'), import('path')]);` imports required Node.js modules. Next.js doesn't throw compilation error because of the `NODE_ENV` check.
- `const metadataPath = path.join(...)` builds path to the metadata file. `".next/server/app"` is the folder path where Next.js compiles files. At this case `metadataPath` is **/src/vovk/vovk-metadata.json**.
- `await write(metadataPath, metadata, { fs, path });` writes metadata file. It accepts 3 arguments: the path to the metadata, the metadata object and reference to standard Node.js libraries (`'fs/promises'` and `'path'`). The last one makes internal Vovk.ts code to not import these modules by itself and prevents compilation errors.

`initVovk` returns an object that includes all handlers for any potential HTTP method.

```ts
export const { GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD } = initVovk(/* ... */)
```

The resulting JSON is going to contain information about controllers and workers and would look like that:

```json
{
  "HelloController": {
    "controllerName": "HelloController",
    "_prefix": "hello",
    "_handlers": {
      "getHello": {
        "path": "get-hello",
        "httpMethod": "GET"
      },
      "postHello": {
        "path": "post-hello",
        "httpMethod": "POST"
      }
    }
  },
  "UserController":  {
    "controllerName": "UserController",
    "_prefix": "user",
    "_handlers": {
      "getHello": {
        "path": "update-user",
        "httpMethod": "PUT"
      }
    }
  },
  "workers": {
    "HelloWorkerService": {
      "workerName": "HelloWorkerService",
      "_handlers": {
        "calculatePi": {
          "isGenerator": true
        }
      }
    }
  }
}
```


### 4. Create first service and controller

Create two files `HelloService.ts` and `HelloController.ts` at **/src/vovk/hello/**. The first one is a back-end service that should perform DB calls or invoke third-party APIs, the second one is a controller that handles incoming HTTP requests and calls service methods.


```ts
// /src/vovk/hello/HelloService.ts
export default class HelloService {
  static async getHello() {
    return { greeting: 'Hello world!' };
  }
}
```

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

- `@prefix` and `@get` build API endpoint `/api/hello/greeting`.
- `controllerName` is required to build **vovk-metadata.json**.
- `HelloService` is assigned as a `private static` and called at the route handler `getHello`.

### 5. Add the controller to the controllers array

```ts
// /src/app/api/[[...]]/route.ts
import { initVovk } from 'vovk';
import HelloController from '../../../HelloController'

export const { GET, POST, PUT, DELETE } = initVovk({
  controllers: [HelloController],
  // ...
});
```

To trigger metadata creation manually, open [http://localhost:3000/api](http://localhost:3000/api) in your browser (it's OK to see 404 error since the root endpoint isn't defined).

### 6. Set up application state and clientize the controller

**Vovk.ts** archirecture assumes that a developer is going to be free to choose any app state management library (Redux/Toolkit, Mobx, Recoil, custom context, etc).

```ts
// /src/vovk/hello/HelloState.ts
import { clientizeController } from "vovk/client";
import type HelloWorkerService from "./HelloWorkerService";
import type HelloController from "./HelloController";
import metadata from '../vovk-metadata.json' assert { type: "json" };

const controller = clientizeController<typeof HelloController>(metadata.HelloController);

export function getHello() {
  return controller.getHello();
}
```


### 7. Make the first request from page.tsx

Call `getHello()` inside the `useEffect` hook to make tha HTTP request to receive data from the Back-end Service.

```tsx
// /src/app/page.tsx
"use client";
import { useEffect, useState } from 'react';
import { getHello } from '../vovk/hello/HelloState';

export default function Home() {
  const [serverResponse, setServerResponse] = useState<{ greeting: string } | null>(null);

  useEffect(() => {
    getHello().then(setServerResponse);
  }, []);

  return (
    <div>{serverResponse?.greeting ?? 'Loading...'}</div>
  );
}
```

## 8. Optional: create metadata.ts for easier import

It's hard to type `import metadata from '../vovk-metadata.json'` every time since TypeScript doesn't know what you're going to name this variable. For easier import you can create another file called **metadata.ts**
 that re-exports Vovk metadata.



```ts
// /src/vovk/metadata.ts
import metadata from './vovk-metadata.json' assert { type: "json" };

export default metadata;
```

Now when you type "metad..." word your code editor is going to propose you to import the created variable.

```ts
// /src/vovk/hello/HelloState.ts
// ...
import metadata from '../metadata';

const controller = clientizeController<typeof HelloController>(metadata.HelloController);

// ...
```