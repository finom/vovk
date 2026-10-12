<p align="center">
  <a href="https://vovk.dev">
    <picture>
      <source width="300" media="(prefers-color-scheme: dark)" srcset="https://vovk.dev/vovk-logo-white.svg">
      <source width="300" media="(prefers-color-scheme: light)" srcset="https://vovk.dev/vovk-logo.svg">
      <img width="300" alt="vovk" src="https://vovk.dev/vovk-logo.svg">
    </picture>
  </a>
  <br>
  <strong>Back-end Framework for Next.js App Router</strong>
  <br />
  <em>One codebase → type-safe clients, OpenAPI, and AI tools</em>
  <br />
  <a href="https://vovk.dev/">Documentation</a>
  &nbsp;&nbsp;
  <a href="https://vovk.dev/quick-install">Quick Start</a>
  &nbsp;&nbsp;
  <a href="https://vovk.dev/performance">Performance</a>
</p>

---

## vovk-ajv [![npm version](https://badge.fury.io/js/vovk-ajv.svg)](https://www.npmjs.com/package/vovk-ajv)

[Ajv](https://ajv.js.org/) [client-side validation](https://vovk.dev/imports#validateonclient) for the generated Vovk.ts TypeScript client. Before a request goes out, it checks the `body`, `query` and `params` against the procedure's JSON Schema, so invalid input fails in the browser without a round trip. The server still validates every request.

## Install

`npx vovk-cli init` installs and configures it. By hand:

```sh
npm install vovk-ajv
```

Then point the client at it in `vovk.config.mjs` and run `vovk generate` (or `vovk dev`):

```js
/** @type {import('vovk').VovkConfig} */
const config = {
  outputConfig: {
    imports: {
      validateOnClient: 'vovk-ajv',
    },
  },
};

export default config;
```

## What a failed check looks like

```ts
import { UserRPC } from '@/client';

try {
  await UserRPC.getUser({ params: { id: 'not-a-uuid' } });
} catch (e) {
  // an HttpException with statusCode 0 and the message
  // "Client-side validation failed. Invalid params: data/id must match format "uuid""
  // e.cause holds the input, Ajv's errors and the endpoint; no request was sent
}
```

To skip the check for one call, pass `disableClientValidation: true`.

## Options

Ajv options and the JSON Schema draft go under `libs.ajv` in `vovk.config.mjs`. The client reads them from the schema (`.vovk-schema/_meta.json`), so they must be JSON:

```js
/** @type {import('vovk').VovkConfig} */
const config = {
  outputConfig: {
    imports: { validateOnClient: 'vovk-ajv' },
  },
  libs: {
    /** @type {import('vovk-ajv').VovkAjvConfig} */
    ajv: {
      options: { strict: false }, // Ajv options
      target: 'draft-2020-12', // or 'draft-07'; read from the schema's $schema when left out
    },
  },
};

export default config;
```

- Ajv runs with `strict: false` unless the options say otherwise, so keywords JSON Schema doesn't define, such as `example` or `x-*`, don't fail the check.
- `params`, `query` and a `FormData` or `URLSearchParams` body are strings, so they are checked with `coerceTypes: true`: `"5"` passes as a number. What is sent stays as given.
- Where Ajv can't generate code, as on a page whose Content Security Policy has no `'unsafe-eval'`, the client skips the checks and warns once.

## Docs

- [Client-side validation](https://vovk.dev/imports#vovk-ajv)
- [TypeScript client](https://vovk.dev/typescript), [Config](https://vovk.dev/config)
