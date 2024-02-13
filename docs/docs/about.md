---
sidebar_position: -1
---

# About

Next.js de facto became a standard framework for front-end React applications that includes SSR, HMR, ready-to-go router, bunch of loaders and many more other features out of the box. Unfortunately to implement back-end capabilities a developer needs to use insufficient built-in API router that requires to create a lot of folders with route.ts file or use workarounds such as tRPC that implement a custom protocol instead of using well-known REST API. Vovk.ts attempts to fix this problem by implementing a wrapper over Next.js [Optional Catch-all Segment](https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes#optional-catch-all-segments) and automatically compiles a client-side TypeScript library that can be imported from **@vovkts/client**. As a reference it uses auto-generated metadata file **.vovk.json** file from the root of the project that needs to be committed to re-generate the client library later with `npx vovk generate`.

Vovk.ts uses standard APIs such as Fetch API and `Response` object to implement its features. It provides an easy to use library utilising built-in browser and Next.js API that you would use anyway with Next.js route.ts (including [redirect](https://nextjs.org/docs/app/building-your-application/routing/redirecting), [headers](https://nextjs.org/docs/app/api-reference/functions/headers#headers), [req.formData](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#request-body-formdata) etc). If you're new to Next.js I recommend to check [Next.js App Router documentation](https://nextjs.org/docs/app/building-your-application/routing) first.

The project originally inspired by NestJS that is probably the best back-end framework on the market. The first step in Vovk.ts development (that wasn't even considered to be an open-sourced project back then) was an attempt to merge Next.js and NestJS thru Next.js middleware. This attempt wasn't successful and I made a decision to build similar project from scratch using the Optional Catch-all Segment utilising the most important features of NestJS in my opinion: classes, decorators and service-controller pattern. At the same time I find Angular-like features such as dependency injection and the way to define modules to be redundant since I didn't find them useful working tightly witn NestJS for multiple years. 

The library also provides [seamless Web Worker interface](./worker) utilising the same approach with the metadata file to generate main-thread library for heavy in-browser calculations to avoid glitches in the UI when it's applicable. Web Worker is a fantastic technology but it's not used widely because it requires a lot of effort to organise event listeners and `postMessage` calls. Vovk.ts attemtps to popularise this technology to make front-end applications perform faster by moving part of the application logic to another thread.

## Features

- Good old REST API with no new protocols.
- Run full-stack Next.js application on one port avoiding monorepo hell.
- Service-Controller-Repository pattern for the highest code quality.
- Edge runtime is available out of the box.
- Zero dependencies and light weight.
- Generated client code is compact, it's just a wrapper over `fetch` function.
- Bundle and distribute production-ready client API with Webpack, Rollup or another bundler.
- Use standard Next.js API such as Response, headers or redirect, nothing is changed.
- Easy to learn, no new vocabulary and only a few pages of documentation.
- Easily integrated with React Native.
- Streaming for LLM apps with disposable async generators.
- Web Worker interface for multi-threading in browser.
- Customizable.
- Well-tested.
- TypeScript, TypeScript, TypeScript!