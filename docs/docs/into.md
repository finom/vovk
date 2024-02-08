---
sidebar_position: 0
---

# Getting Started

## About Vovk.ts

Next.js de facto became a standard framework for front-end React applications that includes SSR, HMR, ready-to-go router, bunch of loaders and many more other features out of the box. Unfortunately to implement back-end capabilities a developer needs to use insufficient built-in API router that requires to create a lot of folders with route.ts file or use workarounds such as tRPC that implement a custom protocol instead of using well-known REST API. Vovk.ts attempts to fix this problem by implementing a wrapper over Next.js [Optional Catch-all Segment](https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes#optional-catch-all-segments) and automatically compiles a client-side TypeScript library that can be imported from **@vovkts/client**. As a reference it uses auto-generated metadata file **.vovk.json** file from the root of the project that needs to be committed to re-generate the client library later with `npx vovk generate`.

Vovk.ts uses standard APIs such as Fetch API and `Response` object to implement its features. It provides an easy to use library utilising built-in browser and Next.js API that you would use anyway with Next.js route.ts (including [redirect](https://nextjs.org/docs/app/building-your-application/routing/redirecting), [headers](https://nextjs.org/docs/app/api-reference/functions/headers#headers), [req.formData](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#request-body-formdata) etc). If you're new to Next.js I recommend to check [Next.js App Router documentation](https://nextjs.org/docs/app/building-your-application/routing) first.

The project originally inspired by NestJS that is probably the best back-end framework on the market. The first step in Vovk.ts development (that wasn't even considered to be an open-sourced project back then) was an attempt to merge Next.js and NestJS thru Next.js middleware. This attempt wasn't successful and I made a decision to build similar project from scratch using the Optional Catch-all Segment utilising the most important features of NestJS in my opinion: classes, decorators and service-controller pattern. At the same time I find Angular-like features such as dependency injection and the way to define modules to be redundant since I didn't find them useful working tightly with NestJS for multiple years.

The library also provides [seamless Web Worker interface](./worker) utilising the same approach with the metadata file to generate main-thread library for heavy in-browser calculations to avoid glitches in the UI when it's applicable. Web Worker is a fantastic technology but it's not used widely because it requires a lot of effort to organise event listeners and `postMessage` calls. Vovk.ts attemtps to popularise this technology to make front-end applications perform faster by moving part of the application logic to another thread.

## Features

- Run a RESTful full-stack Next.js application on one port avoiding monorepo hell.
- No new protocols or other tricks.
- Service-Controller-Repository pattern for the highest code quality.
- Edge runtime is available out of the box.
- Zero dependencies and light weight.
- Generated client code is compact, it's just a wrapper over `fetch` function.
- Bundle and distribute production-ready client API with Webpack, Rollup or another bundler.
- Use standard Next.js API such as headers or redirect, nothing is changed.
- Easy to learn, only a few pages of documentation.
- Interactive examples.
- Easily integrated with React Native.
- Streaming for LLM apps with disposable async iterators.
- Web Worker interface for multi-threading in browser.
- Customizable: you can override default behaviour of resource fetching and implement any custom options.
- Well-tested.
- TypeScript, TypeScript, TypeScript!

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
npm i vovk @vovkts/client
```
or
```
yarn add vovk @vovkts/client
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

### 3. Set up Next.js wildcard route handler and export types read by the client library

Create file **/src/app/api/[[...vovk]]/route.ts** where **[[...vovk]]** is a folder name insicating what Next.js documentation calls ["Optional Catch-all Segment"](https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes#optional-catch-all-segments) that [can be customized](./customization). This is the core entry point for all **Vovk.ts** routes.

```ts
// /src/app/api/[[...vovk]]/route.ts
import { initVovk } from 'vovk';

export const runtime = 'edge';

const controllers = {};
const workers = {};

// export types used by the client
export type Controllers = typeof controllers;
export type Workers = typeof workers;

export const { GET, POST, PUT, DELETE } = initVovk({ controllers, workers });
```

Enabling Edge Runtime is optional.


### 4. Create first controller and add it to the controller object

Create `HelloController.ts` at **/src/modules/hello/** with same-named static class. 

```ts
// /src/modules/hello/HelloController.ts
import { get, prefix } from "vovk";

@prefix('hello')
export default class HelloController {
    @get('greeting')
    static getHello() {
        return { greeting: 'Hello world!' };
    }
}
```

And add this class at **/src/app/api/[[...vovk]]/route.ts** to the `controllers` object.

```ts
// /src/app/api/[[...vovk]]/route.ts
import HelloController from '../../../modules/hello/HelloController';

// ...
const controllers = { HelloController };
// ...
```

## Create a React component and run `vovk dev`

Once you run `npx vovk dev` that replaces the original `npx next dev` you're going to notice the new file **.vovk.json** created in the root of your project. This file contains required information to build the client and needs to be committed. It's going to be updated automatically when your project structure is changed.

Besides **.vovk.json** the command also generates client **.js** and **.ts** files inside **node_modules/.vovk** that are re-exported by **@vovkts/client** module to produce no errors if **@vovkts/client** is not installed. This approach is borrowed from Prisma ORM.

Now the client is generated you can safaly import your client library from **@vovkts/client**.

```tsx
'use client';
import { useState } from 'react';
import { HelloController } from '@vovkts/client';
import type { VovkClientReturnType } from 'vovk';

export default function MyComponent() {
  const [serverResponse, setServerResponse] = useState<VovkClientReturnType<typeof HelloController.getHello>>();

  return (
    <>
      <button
        onClick={async () => {
          const response = await HelloController.getHello();
          setServerResponse(response);
        }}
      >
        Get Greeting from Server
      </button>
      <div>{serverResponse?.greeting}</div>
    </>
  );
}
```

Note that if you're using VSCode you're probably going to need to [restart TS server](https://stackoverflow.com/questions/64454845/where-is-vscodes-restart-ts-server) each time when you add a new controller or worker service to your app because by the time being TS Server doesn't update export types imported from **node_modules** automatically when they were changed. This is a well-known problem that bothers Prisma ORM developers for long time. In all other scenarios (when you add a new method, change input types, etc) you don't need to do that since TS reads `Controllers` and `Workers` that you export from **/src/app/api/[[...vovk]]/route.ts**.

Note that Next.js Server Components are also supported but require to define absolute URL (by default all requests are made to `/api`). Check the !!!!Server Component example for more information.

## Build and deploy

Use the regular `npx next build` to build the project. If the client wasn't generated in **node_modules/.vovk** before you going to get compilation errors if **@vovkts/client** was imported somewhere in the app. To re-generate client with existing **.vovk.json** without re-builing the project itself you need to run `npx vovk generate` that updates **node_modules/.vovk** folder on deployment or after you've reinstalled your **node_modules**. 

To easily build the project on Vercel you can create `"vercel-build"` npm script at **package.json** that is going to generate client before build.

```json
"scripts": {
    "vercel-build": "vovk generate && next build"
}
```

## Examples 

You can check additional examples [here](https://vovk-examples.vercel.app/).