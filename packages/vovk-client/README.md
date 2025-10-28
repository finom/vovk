<p align="center">
  <a href="https://vovk.dev">
    <picture>
      <source width="300" media="(prefers-color-scheme: dark)" srcset="https://vovk.dev/vovk-logo-white.svg">
      <source width="300" media="(prefers-color-scheme: light)" srcset="https://vovk.dev/vovk-logo.svg">
      <img width="300" alt="vovk" src="https://vovk.dev/vovk-logo.svg">
    </picture>
  </a>
  <br>
  <strong>Back-end for <a href="https://nextjs.org/">Next.js</a></strong>
</p>

---

## vovk-client [![npm version](https://badge.fury.io/js/vovk-client.svg)](https://www.npmjs.com/package/vovk-client)

A module that re-exports generated client from **node_modules/.vovk-client**.

```sh
npm install vovk-client
```

```ts
import { UserRPC } from 'vovk-client';

await UserRPC.updateUser({ body, query, params });
```