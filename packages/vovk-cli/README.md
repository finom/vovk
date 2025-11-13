<p align="center">
  <a href="https://vovk.dev">
    <picture>
      <source width="300" media="(prefers-color-scheme: dark)" srcset="https://vovk.dev/vovk-logo-white.svg">
      <source width="300" media="(prefers-color-scheme: light)" srcset="https://vovk.dev/vovk-logo.svg">
      <img width="300" alt="vovk" src="https://vovk.dev/vovk-logo.svg">
    </picture>
  </a>
  <br>
  <strong>Back-end for Next.js</strong>
  <br />
  <a href="https://vovk.dev/about">About Vovk.ts</a>
  &nbsp;
  <a href="https://vovk.dev/quick-install">Quick Start</a>
  &nbsp;
  <a href="https://github.com/finom/vovk">Github Repo</a>
</p>

---

## vovk-cli [![npm version](https://badge.fury.io/js/vovk-cli.svg)](https://www.npmjs.com/package/vovk-cli)

The Vovk.ts [CLI](https://vovk.dev/cli) that will be used as a devDependency in a Vovk.ts app.

```sh
npm install -D vovk-cli
```

- [vovk dev](https://vovk.dev/dev) - starts the development script that watches the changes in [controllers](https://vovk.dev/controller) and regenerates the [schema](https://vovk.dev/schema) and [client](https://vovk.dev/typescript).
- [vovk generate](https://vovk.dev/generate) - generates the client based on the schema.
- [vovk bundle](https://vovk.dev/bundle) - bundles the client with [tsdown](https://tsdown.dev/).
- [vovk init](https://vovk.dev/init) - initializes Vovk.ts project.
- [vovk new](https://vovk.dev/new) - generates a new controller, service or a custom module.

```sh
npx vovk-cli --help
```
