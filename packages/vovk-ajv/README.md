<p align="center">
  <a href="https://vovk.dev">
    <picture>
      <source width="300" media="(prefers-color-scheme: dark)" srcset="https://vovk.dev/vovk-logo-white.svg">
      <source width="300" media="(prefers-color-scheme: light)" srcset="https://vovk.dev/vovk-logo.svg">
      <img width="300" alt="vovk" src="https://vovk.dev/vovk-logo.svg">
    </picture>
  </a>
  <br>
  <strong>RESTful API + RPC = ♥️</strong>
</p>

<p align="center">
  Back-end for <a href="https://nextjs.org/docs/app">Next.js</a>
</p>

---

## vovk-ajv [![npm version](https://badge.fury.io/js/vovk-ajv.svg)](https://www.npmjs.com/package/vovk-ajv)

[Ajv](https://ajv.js.org/) [client-side validation](https://vovk.dev/validation/client) for Vovk.ts. Exports `validateOnClient` function that can be injected into `createRPC` function at the generated RPC client by modifying [imports config](https://vovk.dev/imports#validateonclient).

```ts
/** @type {import('vovk').VovkConfig} */
const config = {
  generatorConfig: {
    imports: {
      validateOnClient: 'vovk-ajv',
    },
  },
  libs: {
    /** @type {import('vovk-ajv').VovkAjvConfig} */
    ajv: {
      options: {
        strict: false,
      },
      localize: 'de',
    },
  },
};
 
export default config;
```
