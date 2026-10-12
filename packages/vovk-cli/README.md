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

The Vovk.ts command line. It sets up a project, watches the controllers, writes the schema and generates the TypeScript, Python and Rust clients and the OpenAPI document. It needs Node.js 24.15+ and goes in the dev dependencies, next to [vovk](https://www.npmjs.com/package/vovk).

## Set up

In a Next.js app with the App Router and TypeScript:

```sh
npx vovk-cli@latest init
```

`vovk init` asks a few questions (`-y` takes the defaults). It installs the dependencies, turns on `experimentalDecorators` in `tsconfig.json`, writes `vovk.config.mjs` and sets the npm scripts:

```json
{
  "scripts": {
    "dev": "vovk dev --next-dev",
    "prebuild": "vovk generate"
  }
}
```

`npm run dev` starts `next dev` and the Vovk.ts watcher together. `prebuild` generates the client before `next build`.

Then create a segment and a module from the built-in templates:

```sh
npx vovk new segment
npx vovk new controller service user
```

## Commands

| Command | What it does |
| --- | --- |
| [`vovk dev`](https://vovk.dev/dev) | Watches the controllers, writes the schema to `.vovk-schema/` and generates the client again on every change. `--next-dev` also runs `next dev` on a free port; arguments after `--` go to `next dev`. |
| [`vovk generate`](https://vovk.dev/generate) | Generates the clients from `.vovk-schema/`. `--from py --out ./python_package` picks other templates; `--openapi <file or URL>` adds a third-party API as an [OpenAPI mixin](https://vovk.dev/mixins). |
| [`vovk bundle`](https://vovk.dev/bundle) | Builds the TypeScript client into a publishable npm package (needs `bundle.build` in the config). |
| [`vovk new`](https://vovk.dev/new) | Creates a segment, a controller, a service or a module of your own template. `--dry-run` writes nothing. |
| [`vovk init`](https://vovk.dev/init) | Sets up Vovk.ts in an existing Next.js app. `--use-pnpm`, `--skip-install`, `--bundle` and more. |

`npx vovk --help` and `npx vovk <command> --help` list every flag.

## Config

`vovk.config.mjs` at the project root. A few common options:

```js
/** @type {import('vovk').VovkConfig} */
const config = {
  outputConfig: {
    // client-side validation in the generated client
    imports: { validateOnClient: 'vovk-ajv' },
  },
  composedClient: {
    // also generate the Python client
    fromTemplates: ['ts', 'py'],
  },
  clientTemplateDefs: {
    py: {
      extends: 'py',
      // the server the Python client calls; the TypeScript client keeps relative URLs
      outputConfig: { origin: 'https://example.com' },
    },
  },
};

export default config;
```

See [Config](https://vovk.dev/config) for every option.

## Docs

- [Quick Start](https://vovk.dev/quick-install)
- [vovk dev](https://vovk.dev/dev), [vovk generate](https://vovk.dev/generate), [vovk bundle](https://vovk.dev/bundle), [vovk new](https://vovk.dev/new), [vovk init](https://vovk.dev/init)
- [Config](https://vovk.dev/config), [Client templates](https://vovk.dev/templates), [Schema](https://vovk.dev/schema)
