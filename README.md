<p align="center">
  <img width="250" alt="vovk" src="https://github.com/finom/vovk/assets/1082083/86bfbbbb-3600-435b-a74c-c07bd0c4af4b"> <br>
  <picture>
    <source width="350" media="(prefers-color-scheme: dark)" srcset="https://github.com/finom/vovk/assets/1082083/35887c40-ad37-42ca-b0b3-1d3ec359b090">
    <source width="350" media="(prefers-color-scheme: light)" srcset="https://github.com/finom/vovk/assets/1082083/e8e4b68d-b713-4562-a55b-407c68215513">
    <img width="350" alt="vovk" src="https://github.com/finom/vovk/assets/1082083/e8e4b68d-b713-4562-a55b-407c68215513">
  </picture>
</p>

<p align="center">
  <strong>The cheapest way to do build and deploy a full-stack Node.js + React app</strong>
  <br />
  Built on top of Next.js App Router
</p>

<p align="center">
  <a href="https://vovk.dev/">Website</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://docs.vovk.dev/">Documentation</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://github.com/finom/vovk-zod">vovk-zod</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://github.com/finom/vovk-hello-world">vovk-hello-world</a>
</p>
<br>
<p align="center">
  <a href="https://www.npmjs.com/package/vovk"><img src="https://badge.fury.io/js/vovk.svg" alt="npm version" /></a>&nbsp;
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg" alt="TypeScript" /></a>&nbsp;
  <a href="https://github.com/finom/vovk/actions/workflows/main.yml"><img src="https://github.com/finom/vovk/actions/workflows/main.yml/badge.svg" alt="Build status" /></a>
</p>


## Vovk.ts: A Structural add-on for Next.js

1. **Unified Back-End and Front-End Operation on a Single Port**: 
   - Next.js integrates settings for Server-Side Rendering (SSR), Hot Module Replacement (HMR), Web Worker Webpack loader, and router structure and a lot more. These are typically manual setups for developers, streamlined for efficiency.
   - Built atop the public Next.js App router API, Vovk.ts enriches this foundation with clear, well-structured, decorator-based routes, inspired by NestJS, bridging a crucial gap in web development.

2. **Advanced TypeScript Library with `clientizeController`**:
   - This feature innovatively fetches controller methods using their types and metadata. Types are directly extracted from controllers via `VovkRequest<BODY, QUERY>`, extending `NextRequest`, for enhanced functionality and integration.

3. **Facilitating Web Worker Utilization with `promisifyWorker`**:
   - Vovk.ts introduces a user-friendly interface for Web Workers through `promisifyWorker`. This tool is designed to popularize Web Worker usage and contribute to a faster web experience.

4. **Structure Recommendation for Code Centralization**:
   - Eliminates the need to switch between different repositories or folders in a monorepository at most fo cases. Developers can now directly navigate to the controller implementation with Ctrl+Click in VSCode.
   - Addresses the longstanding challenge of sharing TypeScript code between back-end and front-end.

![jump-to-controller](https://github.com/finom/vovk/assets/1082083/6d73e28d-2634-4c52-b895-4fdf55240307)
