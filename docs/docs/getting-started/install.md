# Getting started

## Quick install

Setup Vovk.ts with [create-next-app](https://www.npmjs.com/package/create-next-app)

```
npx create-next-app -e https://github.com/finom/vovk-hello-world
```

Inside the project folder run `npm run dev` and open [http://localhost:3000](http://localhost:3000).

## Manual install

### 1. Create Next.js APP

Follow [this instruction](https://nextjs.org/docs/getting-started/installation) to install Next.js. Use TypeScript, App Router and `src/` directory. If you're using **create-next-app** answer to all questions "Yes".

![](https://github.com/finom/vovk/assets/1082083/b9e600da-a43a-4e30-a089-43e5e4b147ef)

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

Create file **/src/app/[[...]]/route.ts** where **[[...]]** is a real folder name. This is the core entry point for all Vovk.ts routes.

```ts
// /src/app/[[...]]/route.ts
import { activateControllers } from 'vovk';

const controllers = [];

export const { GET, POST, PUT, DELETE } = activateControllers(controllers, {
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

For now the `controllers` array is empty. Notice the `onMetadata` option. It's called whenever the Next.js route is initialised. The function provides two arguments: `metadata` - the metadata of controllers and workers, and `write` - a function created to shorten the code that checks if metadata is changed and updates the metadata file. LEt's break down `onMetadata` option contents.

- `process.env.NODE_ENV === 'development'` checks if mode is development. In other words, the code isn't called in production.
- `const [fs, path] = await Promise.all([import('fs/promises'), import('path')]);` imports required Node.js modules. Next.js doesn't throw compilation error because of `NODE_ENV` check.
- `const metadataPath = path.join(...)` builds path to the metadata file. `".next/server/app"` is the folder path where Next.js compiles files. At this case `metadataPath` is **/src/vovk/vovk-metadata.json**.
- `await write(metadataPath, metadata, { fs, path });` writes metadata file. It accepts 3 arguments: the path to metadata, metadata object and Node.js libraries (`'fs/promises'` and `'path'`). The last one makes internal Vovk.ts code to not import these modules by itself and prevents compilation errors.


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

### 5. Set up application state and clientize the controller

**Vovk.ts** archirecture assumes that a developer is going to be free to choose any app state management library (Redux/Toolkit, Mobx, Recoil, custom context, etc). To follow the common coding style with static classes you can use [use-0](https://github.com/finom/use-0) app state library.

```ts
// /src/vovk/hello/HelloState.ts
import { clientizeController } from "vovk/client";
import { getUse } from "use-0";
import type HelloWorkerService from "./HelloWorkerService";
import type HelloController from "./HelloController";
import metadata from '../vovk-metadata.json' assert { type: "json" };

export default class HelloState {
    private static controller = clientizeController<typeof HelloController>(metadata.HelloController);

    static use = getUse<typeof HelloState>();

    static count = 0;

    static getHello() {
        return this.controller.getHello();
    }
}
```

### 6. Make the first request from page.tsx

Call `HelloState.getHello()` inside the `useEffect` hook to make tha HTTP request to receive data from the Back-end Service. The example also demonstrates how you could use [use-0](https://github.com/finom/use-0) to re-render components when property accessor is called and the value is re-defined.

```tsx
// /src/app/page.tsx
"use client";
import Image from 'next/image';
import HelloState from '../vovk/hello/HelloState';
import { useEffect, useState } from 'react';

export default function Home() {
  const count = HelloState.use('count');
  const [serverResponse, setServerResponse] = useState<{ greeting: string } | null>(null);

  useEffect(() => {
    HelloState.getHello().then(setServerResponse);
  }, []);

  return (
    <div>
        <div onClick={() => HelloState.count++}>Clicks: {count}</div>
        <div className="w-1/2 font-bold">{serverResponse?.greeting ?? 'Loading...'}</div>
    </div>
  );
}
```

## Next steps

///////
