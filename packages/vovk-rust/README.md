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
  <a href="https://vovk.dev/">Documentation</a>
  &nbsp;&nbsp;
  <a href="https://vovk.dev/quick-install">Quick Start</a>
  &nbsp;&nbsp;
  <a href="https://vovk.dev/performance">Performance</a>
</p>

---

## vovk-python [![npm version](https://badge.fury.io/js/vovk-python.svg)](https://www.npmjs.com/package/vovk-python)

Provides template files and necessary utilities to generate [Rust](https://vovk.dev/rust) client.

Install:

```sh
npm i vovk-rust -D
```

Generate:
```sh
npx vovk generate --from rs --out ./rust_package
```

Publish:

```sh
cargo publish --manifest-path rust_package/Cargo.toml
```