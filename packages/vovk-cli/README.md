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

## vovk-cli [![npm version](https://badge.fury.io/js/vovk-cli.svg)](https://www.npmjs.com/package/vovk-cli)

The Vovk.ts CLI. Install it as a dev dependency of a Vovk.ts app.

```sh
npm install -D vovk-cli
```

- [vovk dev](https://vovk.dev/dev) - watches [controllers](https://vovk.dev/procedure) for changes and updates the [schema](https://vovk.dev/schema) and the [client](https://vovk.dev/typescript)
- [vovk generate](https://vovk.dev/generate) - generates the client from the schema
- [vovk bundle](https://vovk.dev/bundle) - bundles the client (needs the `bundle.build` config)
- [vovk init](https://vovk.dev/init) - sets up Vovk.ts in an existing Next.js app
- [vovk new](https://vovk.dev/new) - creates a segment, a controller, a service or a custom module

```sh
npx vovk-cli --help
```
