<p align="center">
  <img width="250" alt="vovk" src="https://github.com/finom/vovk/assets/1082083/86bfbbbb-3600-435b-a74c-c07bd0c4af4b"> <br>
  <picture>
    <source width="350" media="(prefers-color-scheme: dark)" srcset="https://github.com/finom/vovk/assets/1082083/35887c40-ad37-42ca-b0b3-1d3ec359b090">
    <source width="350" media="(prefers-color-scheme: light)" srcset="https://github.com/finom/vovk/assets/1082083/e8e4b68d-b713-4562-a55b-407c68215513">
    <img width="350" alt="vovk" src="https://github.com/finom/vovk/assets/1082083/e8e4b68d-b713-4562-a55b-407c68215513">
  </picture>
</p>

<p align="center">
  Framework for <strong>Next.js</strong>
</p>

<p align="center">
  <a href="https://docs.vovk.dev/">
    Documentation
  </a>
  &nbsp;&nbsp;
  <a href="https://vovk.dev/">
    Website
  </a>
  &nbsp;&nbsp;
  <a href="https://github.com/finom/vovk-zod">
    vovk-zod
  </a>
  &nbsp;&nbsp;
  <a href="https://github.com/finom/vovk-hello-world">
    vovk-hello-world
  </a>
</p>
<br>
<p align="center">
  <a href="https://www.npmjs.com/package/vovk">
  <img src="https://badge.fury.io/js/vovk.svg" alt="npm version" /> 
  </a>
  <a href="https://www.typescriptlang.org/">
  <img src="https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg" alt="TypeScript" /> 
  </a>
  <a href="https://github.com/finom/vovk/actions/workflows/main.yml">
  <img src="https://github.com/finom/vovk/actions/workflows/main.yml/badge.svg" alt="Build status" />
  </a>
</p>

**Vovk.ts** is a meta-isomorphic full-stack framework built on top of Next.js that solves multiple core issues in web development:

1. Run well-structured back-end and front-end on one port. 
    - Next.js provides well-established front-end arthitecture with settings preset that implement SSR, HMR, Web Worker Webpack loader, router structure, and many other things that developers needed to set up manually before.
    - Vovk.ts is built over the public Next.js App router API and provides the missing detail: clear, well-structured decorator-based (insppired by NestJS) routes.
1. Create a TypeScript library with `clientizeController` that fetches controller methods using their types and metadata. Types are read directly from a controller using `VovkRequest<BODY, QUERY>` that extends `NextRequest`.
1. Provides useful interface to use Web Workers with `promisifyWorker` that intended to popularise usage of Web Workers and make web a little bit faster.
1. Introduces the new architecture pattern to keep all your back-end and app state code in one place.
    - No need to switch between repositories or folders in a monorepository. Jump thraight to the controller implementation with Ctrl+Click in VSCode.
    - Solves very old problem on how to share TypeScript code between back-end and front-end introducing so-called Isomorphic Service

![jump-to-controller](https://github.com/finom/vovk/assets/1082083/6d73e28d-2634-4c52-b895-4fdf55240307)
