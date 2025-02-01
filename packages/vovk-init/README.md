<p align="center"> 
  <picture>
    <source width="300" media="(prefers-color-scheme: dark)" srcset="https://vovk.dev/vovk-logo-white.svg">
    <source width="300" media="(prefers-color-scheme: light)" srcset="https://vovk.dev/vovk-logo.svg">
    <img width="300" alt="vovk" src="https://vovk.dev/vovk-logo.svg">
  </picture><br>
  <strong>REST + RPC = ♥️</strong>
</p>

<p align="center">
  Back-end meta-framework for <a href="https://nextjs.org/docs/app">Next.js</a>
</p>

---

## vovk-init [![npm version](https://badge.fury.io/js/vovk-init.svg)](https://www.npmjs.com/package/vovk-init)

CLI setup wizard for Vovk.ts that asks about preferred validation library, updates **tsconfig.json** to make the project support decorators, updates NPM scripts, creates [config file](https://vovk.dev/config) and installs the necessary dependencies.

```sh
npx vovk-init
```

The package is a shortcut for `npx vovk-cli init` provided by [vovk-cli](https://vovk.dev/cli).

In order to get all the supported flags, please check the [documentation](https://vovk.dev/cli/vovk-init) or run:

```sh
npx vovk-init help
```
