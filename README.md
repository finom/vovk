<p align="center">
  <a target="_blank" class="font-semibold" href="https://supportukrainenow.org/">🌻 Support Ukraine Now! 🇺🇦</a>
</p>

<hr />

<p align="center"> 
  <picture>
    <source width="300" media="(prefers-color-scheme: dark)" srcset="https://vovk.dev/vovk-logo-white.svg">
    <source width="300" media="(prefers-color-scheme: light)" srcset="https://vovk.dev/vovk-logo.svg">
    <img width="300" alt="vovk" src="https://vovk.dev/vovk-logo.svg">
  </picture><br>
  <strong>RESTful RPC for Next.js</strong>
</p>

<p align="center">
  Transforms <a href="https://nextjs.org/docs/app">Next.js</a> into a powerful and extensible REST API platform with RPC capabilities. 
</p>

<p align="center">
  <a href="https://vovk.dev/">Documentation</a>&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://vovk-examples.vercel.app/">Interactive Examples</a>&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://github.com/finom/vovk-zod">vovk-zod</a>&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://github.com/finom/vovk-hello-world">vovk-hello-world</a>&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://github.com/finom/vovk-react-native-example">vovk-react-native-example</a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/vovk"><img src="https://badge.fury.io/js/vovk.svg" alt="npm version" /></a>&nbsp;
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg" alt="TypeScript" /></a>&nbsp;
  <a href="https://github.com/finom/vovk/actions/workflows/main.yml"><img src="https://github.com/finom/vovk/actions/workflows/main.yml/badge.svg" alt="Build status" /></a>
</p>


 <br />

Example back-end Controller Class:

```ts
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

Example component that uses the auto-generated client library:

```ts
'use client';
import { useState } from 'react';
import { HelloController } from 'vovk-client';
import type { VovkClientReturnType } from 'vovk';

export default function Example() {
  const [
    serverResponse, setServerResponse,
  ] = useState<VovkClientReturnType<typeof HelloController.getHello>>();

  return (
    <>
      <button
        onClick={async () => {
          setServerResponse(
            await HelloController.getHello()
          );
        }}
      >
        Get Greeting from Server
      </button>
      <div>{serverResponse?.greeting}</div>
    </>
  );
}
```
