<!--
TODO
Common: renew deps
vovk.dev: Review & fix doc links, README, use inline script to change theme on load, OG image
Examples: OG image for each example, workers on mobile, favicon
Misc: update personal README, add project to opensource.gubanov
Docs: local search

Minor
vovk.dev: improve video
Docs: Algolia, External link icons
Examples: ugly Other Examples
-->

<p align="center">
  <img width="250" alt="vovk" src="https://github.com/finom/vovk/assets/1082083/86bfbbbb-3600-435b-a74c-c07bd0c4af4b"> <br>
  <picture>
    <source width="350" media="(prefers-color-scheme: dark)" srcset="https://github.com/finom/vovk/assets/1082083/35887c40-ad37-42ca-b0b3-1d3ec359b090">
    <source width="350" media="(prefers-color-scheme: light)" srcset="https://github.com/finom/vovk/assets/1082083/e8e4b68d-b713-4562-a55b-407c68215513">
    <img width="350" alt="vovk" src="https://github.com/finom/vovk/assets/1082083/e8e4b68d-b713-4562-a55b-407c68215513">
  </picture>
</p>

<p align="center">
  <strong>REST for Next</strong>
  <br />
  <br />
  Vovk.ts is an extension over documented Next.js App API routes that enables you to create a REST API as easy as you can imagine.
</p>




<p align="center">
  <a href="https://vovk.dev/">Website</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://docs.vovk.dev/">Documentation</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://vovk-examples.vercel.app/">Interactive Examples</a>
  <br />
  <br />
  <a href="https://github.com/finom/vovk-zod">vovk-zod</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://github.com/finom/vovk-hello-world">vovk-hello-world</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://github.com/finom/vovk-react-native-example">vovk-react-native-example</a>
</p>
 <br />
<p align="center">
  <a href="https://www.npmjs.com/package/vovk"><img src="https://badge.fury.io/js/vovk.svg" alt="npm version" /></a>&nbsp;
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg" alt="TypeScript" /></a>&nbsp;
  <a href="https://github.com/finom/vovk/actions/workflows/main.yml"><img src="https://github.com/finom/vovk/actions/workflows/main.yml/badge.svg" alt="Build status" /></a>
</p>


 <br />

```ts
// /src/modules/hello/HelloController.ts
import { get, prefix } from 'vovk';

@prefix('hello')
export default class HelloController {
  /**
   * Return a greeting from 
   * GET /api/hello/greeting
   */
  @get('greeting')
  static getHello() {
    return { greeting: 'Hello world!' };
  }
}
```

