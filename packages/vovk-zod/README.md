<p align="center">
  <a href="https://vovk.dev">
    <picture>
      <source width="300" media="(prefers-color-scheme: dark)" srcset="https://vovk.dev/vovk-logo-white.svg">
      <source width="300" media="(prefers-color-scheme: light)" srcset="https://vovk.dev/vovk-logo.svg">
      <img width="300" alt="vovk" src="https://vovk.dev/vovk-logo.svg">
    </picture>
  </a>
  <br>
  <strong>Back-end for Next.js (beta)</strong>
  <br />
  <a href="https://vovk.dev/about">About Vovk.ts</a>
  &nbsp;
  <a href="https://vovk.dev/quick-install">Quick Start</a>
  &nbsp;
  <a href="https://github.com/finom/vovk">Github Repo</a>
</p>

---

## vovk-zod [![npm version](https://badge.fury.io/js/vovk-zod.svg)](https://www.npmjs.com/package/vovk-zod)

[Zod](https://www.npmjs.com/package/zod) validation library for Vovk.ts.

```sh
npm install vovk-zod
```

```ts
import { withZod } from 'vovk-zod';
import { post, prefix } from 'vovk';
import { z } from 'zod';

@prefix('users')
export default class UserController {
  @post('{id}')
  static updateUser = withZod({
    body: z.object({
      name: z.string().min(2).max(100),
      email: z.string().email(),
    }),
    query: z.object({
      includePosts: z.boolean().default(false),
    }),
    params: z.object({
      id: z.string().uuid(),
    }),
    handle: (req) => {
      // ...
    },
  });
}
```

`withZod` imported from `vovk-zod` targets Zod 4. If you need Zod 3 support, import it from `vovk-zod/v3`.

For more information, please visit the [documentation](https://vovk.dev/validation/zod).
