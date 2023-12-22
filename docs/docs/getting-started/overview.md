# Overview 

<!--

Getting Started
Vovk Architecture
Clientize Controller
  Regular Request
  Streaming Request
Validation
Worker
  Getting started
  Clientize and Workers

-->


**Vovk.ts** is a meta-isomorphic full-stack framework built on top of Next.js that solves multiple core issues in web development:

1. Run well-structured back-end and front-end on one port. 
    - Next.js provides well-established front-end arthitecture with settings preset that implement SSR, HMR, Web Worker Webpack loader, router structure, and many other things that developers needed to set up manually before.
    - Vovk.ts is built over the public Next.js App router API and provides the missing detail: clear, well-structured decorator-based (insppired by NestJS) routes.
1. Provides missing types for request body and query string.
1. Creates a TypeScript library with `clientizeController` that fetches controller methods using their types and metadata.
1. Provides world-first useful interface to use Web Workers with `promisifyWorker` that intended to popularise usage of Web Workers and make web a little bit faster.
1. Introduces the new architecture pattern to keep all your back-end and app state code in one place.
    - No need to switch between repositories or folders in a monorepository. Jump thraight to the controller implementation with Ctrl+Click in VSCode.
    - Solves very old problem on how to share TypeScript code between back-end and front-end introducing so-called Isomorphic Service
